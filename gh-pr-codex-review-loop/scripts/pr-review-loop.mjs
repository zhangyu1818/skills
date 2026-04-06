#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import process from 'node:process'

const BOT_ACTOR = 'chatgpt-codex-connector[bot]'

const SNAPSHOT_QUERY = `query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $commentsCursor: String,
  $reactionsCursor: String,
  $reviewsCursor: String,
  $threadsCursor: String
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      id
      number
      url
      title
      state
      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          createdAt
          author { login }
        }
      }
      reactions(first: 100, after: $reactionsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          content
          createdAt
          user { login }
        }
      }
      reviews(first: 100, after: $reviewsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          state
          body
          submittedAt
          author { login }
        }
      }
      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          startLine
          originalStartLine
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              body
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}`

const THREAD_COMMENTS_QUERY = `query($threadId: ID!, $commentsCursor: String) {
  node(id: $threadId) {
    ... on PullRequestReviewThread {
      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          createdAt
          author { login }
        }
      }
    }
  }
}`

const RESOLVE_MUTATION = `mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread {
      id
      isResolved
    }
  }
}`

function requireToken() {
  const token = process.env.GITHUB_BOT_TOKEN
  if (!token) {
    throw new Error('GITHUB_BOT_TOKEN is not set')
  }
  return token
}

function gh(args, input) {
  const env = {
    ...process.env,
    GH_TOKEN: requireToken(),
  }
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      env,
      input,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch (error) {
    const stderr = error?.stderr?.toString?.().trim?.()
    if (stderr) {
      throw new Error(stderr)
    }
    throw error
  }
}

function ghJson(args, input) {
  const output = gh(args, input)
  try {
    return JSON.parse(output)
  } catch (error) {
    throw new Error(`failed to parse JSON output: ${error.message}`)
  }
}

function currentPr() {
  const pr = ghJson([
    'pr',
    'view',
    '--json',
    'number,url,title,state,reviewDecision',
  ])
  const match = /^https?:\/\/[^/]+\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/.exec(
    pr.url,
  )
  if (!match) {
    throw new Error(`failed to parse PR url: ${pr.url}`)
  }
  return {
    ...pr,
    owner: match[1],
    repo: match[2],
    number: Number(match[3]),
  }
}

function graphql(query, variables) {
  const args = ['api', 'graphql', '-F', 'query=@-']
  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    if (typeof value === 'number') {
      args.push('-F', `${key}=${value}`)
      continue
    }
    args.push('-F', `${key}=${value}`)
  }
  const payload = ghJson(args, query)
  if (payload.errors?.length) {
    throw new Error(JSON.stringify(payload.errors, null, 2))
  }
  return payload
}

function fetchThreadComments(threadId, initialNodes, initialPageInfo) {
  const comments = [...initialNodes]
  let pageInfo = initialPageInfo
  while (pageInfo?.hasNextPage) {
    const payload = graphql(THREAD_COMMENTS_QUERY, {
      threadId,
      commentsCursor: pageInfo.endCursor,
    })
    const connection = payload.data.node.comments
    comments.push(...(connection.nodes ?? []))
    pageInfo = connection.pageInfo
  }
  return comments
}

function fetchSnapshot(pr) {
  const discussionComments = []
  const reactions = []
  const reviewSummaries = []
  const reviewThreads = []
  let commentsCursor = null
  let reactionsCursor = null
  let reviewsCursor = null
  let threadsCursor = null

  for (;;) {
    const payload = graphql(SNAPSHOT_QUERY, {
      owner: pr.owner,
      repo: pr.repo,
      number: pr.number,
      commentsCursor,
      reactionsCursor,
      reviewsCursor,
      threadsCursor,
    })
    const pullRequest = payload.data.repository.pullRequest
    if (!pullRequest) {
      throw new Error('pull request not found')
    }
    const commentsConnection = pullRequest.comments
    const reactionsConnection = pullRequest.reactions
    const reviewsConnection = pullRequest.reviews
    const threadsConnection = pullRequest.reviewThreads

    discussionComments.push(
      ...(commentsConnection?.nodes ?? []).map((comment) => ({
        id: comment.id,
        body: comment.body ?? '',
        createdAt: comment.createdAt,
        userLogin: comment.author?.login ?? null,
      })),
    )
    reactions.push(
      ...(reactionsConnection?.nodes ?? []).map((reaction) => ({
        content:
          reaction.content === 'THUMBS_UP' ? '+1' : reaction.content ?? null,
        createdAt: reaction.createdAt,
        userLogin: reaction.user?.login ?? null,
      })),
    )
    reviewSummaries.push(
      ...(reviewsConnection?.nodes ?? []).map((review) => ({
        id: review.id,
        state: review.state,
        body: review.body ?? '',
        submittedAt: review.submittedAt,
        userLogin: review.author?.login ?? null,
      })),
    )
    for (const thread of threadsConnection?.nodes ?? []) {
      const comments = fetchThreadComments(
        thread.id,
        thread.comments?.nodes ?? [],
        thread.comments?.pageInfo ?? null,
      )
      reviewThreads.push({
        id: thread.id,
        path: thread.path ?? null,
        line: thread.line ?? thread.originalLine ?? null,
        startLine: thread.startLine ?? thread.originalStartLine ?? null,
        isResolved: Boolean(thread.isResolved),
        isOutdated: Boolean(thread.isOutdated),
        comments: comments.map((comment) => ({
          id: comment.id,
          body: comment.body ?? '',
          createdAt: comment.createdAt,
          userLogin: comment.author?.login ?? null,
        })),
      })
    }

    commentsCursor = commentsConnection?.pageInfo?.hasNextPage
      ? commentsConnection.pageInfo.endCursor
      : null
    reactionsCursor = reactionsConnection?.pageInfo?.hasNextPage
      ? reactionsConnection.pageInfo.endCursor
      : null
    reviewsCursor = reviewsConnection?.pageInfo?.hasNextPage
      ? reviewsConnection.pageInfo.endCursor
      : null
    threadsCursor = threadsConnection?.pageInfo?.hasNextPage
      ? threadsConnection.pageInfo.endCursor
      : null

    if (!commentsCursor && !reactionsCursor && !reviewsCursor && !threadsCursor) {
      return {
        discussionComments,
        reactions,
        reviewSummaries,
        reviewThreads,
      }
    }
  }
}

function summarizeThread(thread) {
  const lastComment = thread.comments.at(-1) ?? null
  return {
    id: thread.id,
    path: thread.path,
    line: thread.line,
    startLine: thread.startLine,
    isResolved: thread.isResolved,
    isOutdated: thread.isOutdated,
    commentCount: thread.comments.length,
    authors: [...new Set(thread.comments.map((comment) => comment.userLogin).filter(Boolean))].sort(),
    lastCommentAuthor: lastComment?.userLogin ?? null,
    lastCommentBody: lastComment?.body ?? null,
    comments: thread.comments,
  }
}

function latestBotThumbsUp(reactions) {
  return (
    reactions
      .filter(
        (reaction) =>
          reaction.content === '+1' && reaction.userLogin === BOT_ACTOR,
      )
      .map((reaction) => reaction.createdAt)
      .sort((left, right) => Date.parse(left) - Date.parse(right))
      .at(-1) ?? null
  )
}

function buildStatus() {
  const pr = currentPr()
  const snapshot = fetchSnapshot(pr)
  const threads = snapshot.reviewThreads.map(summarizeThread)
  const actionableThreads = threads.filter(
    (thread) => !thread.isResolved && !thread.isOutdated,
  )
  const blockingReviewSummaries = snapshot.reviewSummaries.filter(
    (review) => review.state === 'CHANGES_REQUESTED',
  )
  const latestThumbsUpAt = latestBotThumbsUp(snapshot.reactions)
  return {
    pullRequest: {
      owner: pr.owner,
      repo: pr.repo,
      number: pr.number,
      url: pr.url,
      title: pr.title,
      state: pr.state,
      reviewDecision: pr.reviewDecision ?? null,
    },
    approval: {
      actor: BOT_ACTOR,
      hasThumbsUp: latestThumbsUpAt !== null,
      latestThumbsUpAt,
    },
    counts: {
      discussionComments: snapshot.discussionComments.length,
      reviewSummaries: snapshot.reviewSummaries.length,
      totalThreads: threads.length,
      actionableThreads: actionableThreads.length,
      blockingReviewSummaries: blockingReviewSummaries.length,
      outdatedUnresolvedThreads: threads.filter(
        (thread) => !thread.isResolved && thread.isOutdated,
      ).length,
    },
    discussionComments: snapshot.discussionComments,
    reviewSummaries: snapshot.reviewSummaries,
    actionable: {
      reviewSummaries: blockingReviewSummaries,
      threads: actionableThreads,
    },
    allThreads: threads,
  }
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function resolveThreads(threadIds) {
  const resolved = threadIds.map((threadId) => {
    const payload = graphql(RESOLVE_MUTATION, { threadId })
    const thread = payload.data.resolveReviewThread.thread
    return {
      id: thread.id,
      isResolved: thread.isResolved,
    }
  })
  printJson({ resolved })
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitApproval(options) {
  const intervalMs = options.intervalSeconds * 1000
  const timeoutMs =
    options.timeoutSeconds > 0 ? options.timeoutSeconds * 1000 : null
  const startedAt = Date.now()
  for (;;) {
    const status = buildStatus()
    if (status.approval.hasThumbsUp) {
      printJson(status)
      return
    }
    if (
      status.actionable.threads.length !== 0 ||
      status.actionable.reviewSummaries.length !== 0
    ) {
      process.stderr.write(
        `${JSON.stringify({ kind: 'feedback', status }, null, 2)}\n`,
      )
      process.exit(10)
    }
    process.stderr.write(
      `[run] pending; no +1 from ${BOT_ACTOR} yet\n`,
    )
    if (timeoutMs !== null && Date.now() - startedAt >= timeoutMs) {
      throw new Error('timed out while waiting for bot thumbs up')
    }
    await sleep(intervalMs)
  }
}

function parsePositiveInteger(raw, flag) {
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flag} must be a positive integer`)
  }
  return value
}

function parseWaitOptions(args) {
  const options = {
    intervalSeconds: 60,
    timeoutSeconds: 0,
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--interval-seconds') {
      const next = args[index + 1]
      if (!next) {
        throw new Error('--interval-seconds requires a value')
      }
      options.intervalSeconds = parsePositiveInteger(next, '--interval-seconds')
      index += 1
      continue
    }
    if (arg === '--timeout-seconds') {
      const next = args[index + 1]
      if (!next) {
        throw new Error('--timeout-seconds requires a value')
      }
      options.timeoutSeconds = parsePositiveInteger(next, '--timeout-seconds')
      index += 1
      continue
    }
    throw new Error(`unknown option: ${arg}`)
  }
  return options
}

function printHelp() {
  process.stdout.write(`usage:
  node scripts/pr-review-loop.mjs
  node scripts/pr-review-loop.mjs run [--interval-seconds 60] [--timeout-seconds 600]
  node scripts/pr-review-loop.mjs status
  node scripts/pr-review-loop.mjs resolve <thread-id>...
`)
}

async function main() {
  const [, , command, ...rest] = process.argv
  if (command === '--help' || command === '-h') {
    printHelp()
    return
  }
  if (!command) {
    await waitApproval({
      intervalSeconds: 60,
      timeoutSeconds: 0,
    })
    return
  }
  if (command === 'run') {
    await waitApproval(parseWaitOptions(rest))
    return
  }
  if (command === 'status') {
    printJson(buildStatus())
    return
  }
  if (command === 'resolve') {
    if (rest.length === 0) {
      throw new Error('resolve requires at least one thread id')
    }
    resolveThreads(rest)
    return
  }
  throw new Error(`unknown command: ${command}`)
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})
