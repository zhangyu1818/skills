---
name: deep-search
description: >-
  Evidence-first deep search and cross-check protocol for programming research and verification.
  Use when solving unknown library/API usage, version-sensitive behavior, migration/breaking-change
  questions, or any request requiring "search + source code proof + documentation proof".
  Treat LLM answers (Perplexity/DeepWiki) as direction only; never as final evidence.
---

# Deep Search

## Core Principle

- Separate direction from evidence.
- Direction tools propose where to look: `mcp__perplexity__perplexity_ask`, `mcp__deepwiki__ask_question`.
- Evidence tools prove claims: official docs, release/tag metadata, source code at pinned commit/tag.
- Two-evidence gate: every key claim needs at least two independent evidence classes, and at least one must be primary (docs/source/release).
- Version anchoring is required for "latest", "current", "changed", "deprecated", and "not supported" claims: include explicit version/tag and date.

## Evidence Hierarchy

- Tier A (primary): official docs, release notes/changelog, source code at pinned tag/commit.
- Tier B: maintainer issues/PR discussions.
- Tier C: community evidence (Reddit/forums/blogs/Stack Overflow).
- Tier D: LLM synthesis (`perplexity`, `deepwiki`) as hypothesis only.

Rules:
- Never end at Tier D.
- Tier C may reveal hidden or private API patterns, but cannot alone prove support.
- Resolve conflicts by higher tier and explicit version scope.

## Tool Map (Ideal Path)

### Direction and Hypothesis

- `mcp__deepwiki__ask_question` (repo-aware orientation and file targeting)
- `mcp__perplexity__perplexity_ask` (broad hypothesis and terminology seeding)

### Search Expansion

- `mcp__brave-search__brave_web_search` (broad search with freshness and filters)
- `mcp__exa__web_search_exa` (semantic technical results with controllable context size)
- `mcp__tavily__tavily_search` (multi-source search with strong community coverage)
- `mcp__tavily__tavily_crawl` (docs-site structure discovery)

### Documentation Verification

- `mcp__context7__resolve-library-id`
- `mcp__context7__query-docs`

### Code Verification

- `mcp__grep__searchGitHub` (cross-repo real usage patterns)
- GitHub tools from the MCP validation report (ideal-path components):
  - `mcp__github__search_repositories`
  - `mcp__github__get_latest_release`
  - `mcp__github__list_tags`
  - `mcp__github__get_release_by_tag`
  - `mcp__github__get_tag`
  - `mcp__github__list_commits`
  - `mcp__github__get_commit`
  - `mcp__github__search_code`
  - `mcp__github__search_issues`
  - `mcp__github__search_pull_requests`
  - `mcp__github__list_releases`
- zread tools from the MCP validation report (ideal-path components):
  - `mcp__zread__search_doc`
  - `mcp__zread__get_repo_structure`
  - `mcp__zread__read_file`

Removed from this skill (do not use):
- `web-search-prime_webSearchPrime`
- `google_search`
- `tavily_extract`
- `github_get_file_contents`

## Route Selection (Step 0)

Classify the task before searching:

- Route A: known open-source repo/library (repo is known or quickly discoverable).
- Route B: unknown or unclear library/API/entity.
- Route C: closed-source product or no reliable public repo.

Choose one route first. Reclassify only when evidence forces it.

## Step Workflow

### Step 1 - Normalize Claims

Convert the user request into testable claims:
- API signature or parameter contract
- default value or runtime behavior
- version introduction/removal/breaking change
- migration path
- "possible vs impossible" claim

Define what evidence would falsify each claim.

### Step 2 - Hypothesis Seed (Direction Only)

- Route A: start with `deepwiki` for likely files and concepts.
- Route B/C: start with `perplexity` for candidate entities and terminology.
- Extract keywords, candidate repos/domains, and likely versions.
- Do not conclude in this step.

### Step 3 - Search Expansion

Run targeted searches with explicit query intent:
- official docs and release pages
- community discussions (including Reddit when needed)
- known issue/PR trails
- comparable OSS implementations for closed-source workflows

Capture candidate URLs and artifacts per claim, not generic reading lists.

### Step 4 - Code-Level Verification

Prove or disprove claims with concrete artifacts:
- search for function/flag/symbol existence
- read surrounding implementation context (not snippet-only reasoning)
- check cross-repo usage patterns for practical feasibility
- if community claims private API usage, find code evidence of invocation pattern and constraints

### Step 5 - Version Anchoring

For every accepted claim, lock scope:
- version/tag/release name
- release or commit date
- stability state: stable, deprecated, experimental, or unofficial

Do not output unscoped "latest" statements.

### Step 6 - Cross-Source Conflict Resolution

For each conflict:
- state the conflict explicitly
- prioritize by hierarchy (A > B > C > D)
- decide using stronger tier plus version scope
- if unresolved, return bounded uncertainty and the minimal next proof step

### Step 7 - Final Output

Return only evidence-backed conclusions with:
- claim result (`true`/`false`/`conditional`)
- supporting sources and version/date scope
- confidence level
- reproducible verification steps

## Branch Playbooks

### Playbook A - Known OSS API

`deepwiki -> docs/source verification -> release/tag lock -> output`

Minimum:
- one documentation proof
- one source or release/tag/commit proof

### Playbook B - Unknown Library/API

`perplexity direction -> web/community search -> locate repo/docs -> code proof -> output`

Minimum:
- convert unknowns into candidate entities
- validate entity using official domain or official repo before concluding

### Playbook C - Closed-Source or No Repo

`search/docs/community triangulation -> similar OSS pattern check -> risk-qualified output`

Minimum:
- explicit "officially supported vs unofficial workaround" boundary
- at least one high-quality external implementation pattern if suggesting workaround

## Mandatory TODO Checklist

Before returning a final answer, complete all items:

- [ ] claims decomposed into testable statements
- [ ] route selected (A/B/C) and recorded
- [ ] direction stage completed without treating it as evidence
- [ ] official docs evidence captured (when applicable)
- [ ] source/release evidence captured
- [ ] community evidence (if used) labeled as non-authoritative
- [ ] conflicts resolved and documented
- [ ] version/date explicitly stated for time-sensitive claims
- [ ] final answer includes reproducible validation steps
- [ ] confidence and risk notes included

If any item remains unchecked, do not produce a definitive conclusion.

## Output Contract (Required Format)

Use this exact structure:

1. Answer
- concise conclusion per claim, version-scoped

2. Evidence Matrix
- `claim -> source -> version/date -> trust tier -> note`

3. Conflicts and Decision
- conflicting statements
- chosen decision and reason

4. Reproduction Steps
- minimal commands/queries/paths another engineer can run

5. Confidence and Risk Notes
- confidence level per claim
- remaining uncertainty and failure modes

## Anti-Patterns

- concluding from `perplexity` or `deepwiki` alone
- saying "cannot be done" without a community plus code search pass
- accepting a blog/forum claim without Tier A proof
- using "latest" without explicit version/tag/date
- mixing evidence from different versions without scope labels
- treating private API workarounds as official support

## Test Cases and Validation Scenarios

1. Library API usage unknown, repo known
- must start repo-oriented and finish with docs plus source/release proof.

2. Perplexity says impossible, community says possible
- must run additional search plus code verification before concluding.

3. No repo, closed-source API
- must triangulate docs/community/similar code and output risk-qualified answer.

4. Latest version behavior change
- must include release/tag/date anchors.

5. Conflicting sources
- must include an explicit conflict resolution section.

6. Insufficient evidence
- must avoid definitive claims and provide minimal next verification steps.

## Behavioral Rules

- `perplexity` and `deepwiki` are navigation hints only.
- For unknown OSS API usage, default quickly to repo-oriented verification.
- For completely unknown direction, start with `perplexity` hypothesis, then run search triangulation.
- Community-discovered private APIs may be reported only as unofficial or high-risk patterns.
- Final claims require two independent evidence classes, with at least one Tier A source.
