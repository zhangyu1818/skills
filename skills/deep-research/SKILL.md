---
name: deep-research
description: >-
  Evidence-first deep research workflow for source-sensitive, version-sensitive, technical, academic,
  product, policy, or current-information questions. Use when answers require web/repo/doc research,
  claim decomposition, cross-validation, conflict resolution, citations, reproducible verification,
  or when the user asks to verify whether something is true/current/supported/deprecated/possible.
---

# Deep Research

## Non-Negotiable Accuracy Policy

- Do not promise absolute correctness. The goal is: every material claim is traceable, version/date scoped, cross-checked, and falsifiable.
- Separate direction from evidence. LLM/search-summary tools may suggest where to look, but they never prove a claim.
- A final claim is allowed only after the evidence gate for that claim is satisfied. If the gate is not satisfied, return bounded uncertainty.
- Search snippets are not evidence. Open/read the underlying page, doc, release, issue, source file, paper, or dataset.
- A citation is valid only if it directly supports the sentence it is attached to.
- For “latest/current/today/deprecated/removed/not supported” claims, always include explicit version, release/tag/commit, publication date, or retrieval date.

## Evidence Tiers

- Tier 0 — Direct verification: commands run, tests executed, source file read at pinned commit/tag, reproducible local output.
- Tier 1 — Primary sources: official docs, source code, release notes, changelogs, standards/specs, regulatory filings, official datasets.
- Tier 2 — Maintainer/operator evidence: maintainer issues, PR discussions, official support/forum answers, vendor staff statements.
- Tier 3 — High-quality secondary sources: peer-reviewed papers, systematic reviews, reputable technical articles, reputable journalism.
- Tier 4 — Community/field reports: Stack Overflow, GitHub Discussions by non-maintainers, Reddit, blogs, examples from real projects.
- Tier 5 — Direction only: Perplexity, DeepWiki, LLM summaries, search result snippets, AI-generated answers.

Conflict priority: Tier 0 > Tier 1 > Tier 2 > Tier 3 > Tier 4 > Tier 5, after matching version/date/scope. Newer is not automatically better if it is less authoritative or for a different version.

## Evidence Gates

Use the strictest applicable gate:

1. Technical API/library claim
   - Required: one Tier 1 docs/release proof and one Tier 0/1 source, tag, release, or reproducible-code proof.
   - Cross-repo usage can support feasibility but cannot prove official support.

2. Version/change/deprecation claim
   - Required: release/changelog/tag/commit evidence plus current docs or source evidence.
   - Include version/tag/commit and release date.

3. Negative claim (“not supported”, “does not exist”, “cannot be done”)
   - Required: official docs/source/release search plus issue/PR/community search for workarounds.
   - If there is no explicit primary denial, say “I found no reliable evidence that…” rather than “impossible”.

4. Closed-source product or no public repo
   - Required: official docs/help/release evidence plus independent corroboration.
   - Workarounds must be labeled unofficial, unsupported, or high-risk unless the vendor documents them.

5. Academic/scientific/medical/legal/financial/high-stakes claim
   - Required: primary literature/data/guidance plus at least one independent high-quality synthesis or authority.
   - Include limitations, certainty, and jurisdiction/population/time scope where relevant.

6. General current factual claim
   - Required: at least two independent sources, preferably one primary/official source.
   - Include dates and distinguish reported claims from confirmed facts.

## Tool Selection and De-Duplication

Do not run all tools by default. Choose the smallest tool set that can satisfy the evidence gate.

### Direction / Hypothesis Only

Use at most one unless the topic is unclear or conflicting:

- `mcp__deepwiki__ask_question`: known GitHub repo/library; use to identify likely files, symbols, concepts.
- `mcp__perplexity__perplexity_ask`: unknown entity, broad terminology, candidate official domains/repos.

Never cite these as final evidence unless their cited sources are independently opened and verified.

### Web Search / Discovery

Default to one search engine; add a second only for low recall, high stakes, or conflict checks.

- `mcp__brave-search__brave_web_search`: default for current web, official pages, freshness, exact-match queries.
- `mcp__exa__web_search_exa`: semantic discovery, technical articles, papers, long-tail terminology.
- `mcp__tavily__tavily_search`: broad multi-source sweep and community coverage.
- `mcp__tavily__tavily_crawl`: docs-site structure discovery only; not proof until specific pages are read.

Avoid duplicate same-query searches across Brave/Exa/Tavily unless the first pass fails or the claim is high-risk.

### Documentation Verification

- `mcp__context7__resolve-library-id` then `mcp__context7__query-docs`: package/library documentation when the library identity is known.
- Official docs pages found by web search are preferred when they expose versioned pages.
- Repository docs, examples, and README files count as evidence only when read at an explicit repo + path + tag/commit/ref.
- For GitHub-hosted repository docs, use GitHub search/metadata to locate the file, then read the file with the GitHub file-read standard below.

### Source / Release / Repo Verification

GitHub-native evidence is the canonical path for repository identity, releases, tags, commits, issues, PRs, and source files.

Use GitHub MCP metadata tools when available:

- `mcp__github__search_repositories`
- `mcp__github__list_releases`
- `mcp__github__get_latest_release`
- `mcp__github__get_release_by_tag`
- `mcp__github__list_tags`
- `mcp__github__get_tag`
- `mcp__github__list_commits`
- `mcp__github__get_commit`
- `mcp__github__search_code`
- `mcp__github__search_issues`
- `mcp__github__search_pull_requests`

Use `mcp__grep__searchGitHub` only for ecosystem usage patterns across repositories. It supports feasibility/community evidence, not official support.

### GitHub File-Read Standard

Preferred path for GitHub-hosted repositories:

1. Locate candidate files with `mcp__github__search_code`, release/tag references, docs links, or repository tree listing.
2. Resolve the exact `ref`: release tag, version tag, or commit SHA. Avoid default-branch reads for version-sensitive claims.
3. Read files with `gh api` when shell execution and GitHub CLI are available.
4. If the environment exposes a GitHub MCP file-read/tree tool, it may replace `gh` only when it supports explicit `owner/repo`, `path`, and pinned `ref`.
5. Record `owner/repo`, `path`, `ref`, commit SHA, and retrieval date in the evidence ledger.

Required `gh` patterns:

```bash
# Read one file at a pinned ref as raw text.
gh api \
  -H "Accept: application/vnd.github.raw+json" \
  "repos/OWNER/REPO/contents/PATH?ref=TAG_OR_COMMIT_SHA"

# List a directory at a pinned ref.
gh api "repos/OWNER/REPO/contents/DIR?ref=TAG_OR_COMMIT_SHA"

# List repository tree paths at a pinned ref.
gh api "repos/OWNER/REPO/git/trees/TAG_OR_COMMIT_SHA?recursive=1" --jq '.tree[].path'

# Get commit metadata before citing source evidence.
gh api "repos/OWNER/REPO/commits/COMMIT_SHA"
```

Rules for file evidence:

- Never rely on an unpinned default branch for version-sensitive claims.
- Read surrounding implementation context, not only one matching line.
- If a file is generated, vendored, minified, or mirrored, prefer the upstream source file.
- Treat `gh`/GitHub API `404` on private repositories as possibly authentication-related, not proof that a file or repo does not exist.
- For large files or very large trees, fall back to shallow/sparse `git` operations and keep the same ref/path evidence standard.

## Route Selection

Classify first. Reclassify only when evidence forces it.

- Route A — Known open-source repo/library/API.
- Route B — Unknown or ambiguous library/API/entity.
- Route C — Closed-source product/SaaS/commercial API/no public repo.
- Route D — General current web research.
- Route E — Academic, scientific, legal, medical, financial, or other high-stakes research.

## Workflow

### Step 1 — Frame the Research Question

Record:

- user question in one sentence
- route selected
- target entities, versions, dates, jurisdictions, platforms, or environments
- what would count as confirming evidence
- what would falsify the claim

Ask a clarifying question only if the missing scope would change the route or evidence gate. Otherwise proceed with stated assumptions.

### Step 2 — Decompose Into Claims

Convert the request into testable claims, such as:

- API exists / parameter exists / behavior occurs
- feature was introduced, changed, deprecated, or removed
- workaround is officially supported vs unofficial
- result is true, false, conditional, or insufficiently evidenced
- recommendation follows from evidence

Track claims independently. Do not let one strong source validate unrelated claims.

### Step 3 — Plan the Evidence Pass

For each claim, choose:

- required evidence gate
- first tool to use
- backup tool if the first pass fails
- likely primary source
- likely contradiction search terms

Keep the plan short. Do not turn it into a generic reading list.

### Step 4 — Direction Pass, If Needed

Use DeepWiki or Perplexity only to identify likely sources, terms, files, versions, or repos.
Extract candidate artifacts, then independently verify them.
Skip this step when the official source/repo is already known.

### Step 5 — Source Discovery

Search targeted queries, not generic ones. Include version/date terms when relevant.
Prioritize:

- official docs / source / releases / specs / datasets
- maintainer issues or PRs
- reputable secondary sources
- community evidence for edge cases, workarounds, or real-world failure modes

Maintain an internal source ledger: source, URL/repo path, date/version, claim supported/refuted, tier, and notes.

### Step 6 — Evidence Extraction

For every candidate source:

- read enough surrounding context to avoid snippet-only reasoning
- extract the exact supporting fact, not just the page title
- note version/date/scope
- label whether it supports, refutes, qualifies, or is irrelevant to the claim

Reject sources that mention the topic but do not support the specific claim.

### Step 7 — Adversarial / Falsification Search

Before finalizing, search for disconfirming evidence:

- technical: `deprecated`, `removed`, `breaking change`, `migration`, `not supported`, `bug`, `issue`, `PR`, `workaround`, `private API`, `regression`
- general research: `criticism`, `limitations`, `contradicts`, `replication`, `correction`, `retraction`, `updated`, `policy change`

Run this step especially for negative claims, recommendations, and high-stakes claims.

### Step 8 — Cross-Validation and Conflict Resolution

For each claim:

- verify evidence independence: same source repeated through mirrors is one source
- verify directness: same entity, version, region, platform, and time period
- resolve conflicts by tier, version/date match, and specificity
- explicitly record unresolved conflicts

If sources disagree and no higher-tier source resolves it, output conditional or insufficient evidence.

### Step 9 — Certainty Grading

Grade each claim:

- High: primary evidence plus independent corroboration; direct support; version/date scoped; no serious unresolved conflict.
- Medium: primary evidence exists but one factor is weaker: indirect corroboration, minor version mismatch, limited reproducibility, or non-critical conflict.
- Low: mostly secondary/community evidence, weak primary evidence, high indirectness, or unresolved conflict.
- Insufficient: evidence gate failed. Do not give a definitive answer.

Downgrade certainty for: source bias, indirect evidence, inconsistent sources, imprecise wording, publication/reporting bias, outdated docs, unverifiable citations, or lack of reproducibility.

### Step 10 — Final Response

Use the compact format unless the user asks for a full report.

```markdown
## Answer
- Claim 1: true / false / conditional / insufficient evidence — version/date scoped conclusion.
- Claim 2: ...

## Evidence Matrix
| Claim | Verdict | Evidence | Scope | Tier | Notes |
|---|---|---|---|---|---|

## Conflicts / Caveats
- Source A says X; Source B says Y. Decision: ... because ...

## Reproduction / Verification Steps
- Query, command, repo path, commit/tag, or document section another person can check.

## Confidence
- Claim 1: High/Medium/Low/Insufficient — reason.
```

For short user-facing answers, collapse sections but preserve: answer, key evidence, conflicts/caveats, confidence.

## Pre-Final Checklist

Before a definitive final answer, verify:

- [ ] route selected
- [ ] claims decomposed
- [ ] evidence gate selected per claim
- [ ] search snippets/LLM summaries not used as evidence
- [ ] at least one primary source used when available
- [ ] citation directly supports each cited sentence
- [ ] version/date/scope recorded for time-sensitive claims
- [ ] contradiction search completed
- [ ] conflicts resolved or disclosed
- [ ] unsupported claims marked as uncertainty, not fact
- [ ] reproducible verification steps included

If any required item fails, do not present the claim as settled.

## Anti-Patterns

- Running every MCP tool with the same query.
- Treating Perplexity, DeepWiki, or search snippets as proof.
- Saying “impossible” because no result was found.
- Mixing evidence from different versions without labels.
- Citing a page that only mentions a topic but does not support the sentence.
- Treating private APIs, examples, or community workarounds as official support.
- Using “latest/current” without date, version, tag, or retrieval timestamp.
- Hiding unresolved conflicts behind a confident summary.
- Reading GitHub files from the default branch when the claim is version-sensitive.

## Validation Scenarios

Use these to test the skill:

1. Known OSS API: answer must include docs plus source/release evidence.
2. Unknown library/API: answer must identify the official repo/domain before concluding.
3. Perplexity says impossible, community says possible: answer must run code/community verification and distinguish official support from workaround.
4. Latest version behavior changed: answer must include release/tag/date anchors.
5. Closed-source product: answer must label unsupported workarounds as unofficial.
6. Conflicting sources: answer must include explicit conflict resolution.
7. Insufficient evidence: answer must refuse a definitive claim and give the minimal next verification step.
8. GitHub source claim: answer must include repo, path, pinned ref/commit, and the exact command or file-read method used.
