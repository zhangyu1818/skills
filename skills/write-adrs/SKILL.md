---
name: write-adrs
description: "Produce ADRs or ADR sets for durable architecture, technology, boundary, migration, security, or operational decisions. Capture decision drivers, alternatives, constraints, consequences, validation signals, implementation freedom, and revision triggers without code-level over-prescription."
---

# ADR Authoring Skill

## Purpose

Create Architectural Decision Records that preserve durable technical reasoning for humans and implementation agents.

An ADR records a decision that future work must remember. It captures the problem pressure, evaluated options, chosen direction, accepted consequences, constraints that must not be violated, implementation freedom that remains open, and conditions that require revision.

The ADR should constrain future work enough to prevent architectural drift. It must not freeze implementation details that are likely to change during coding unless the decision is explicitly about those details.

Generated ADRs should contain only information needed by future reviewers and implementation agents.

## Output Contract

Output one ADR per durable decision. When multiple durable decisions are present, output an ADR set with an index and separate ADRs.

An ADR MUST define exactly one primary decision. Split the ADR when separate decisions have different drivers, consequences, owners, risks, validation signals, or revision triggers.

An ADR MUST NOT contain implementation code.

An ADR MUST NOT prescribe implementation file names, code directories, package names, class names, function names, framework APIs, SDK calls, database DDL, shell commands, dependency installation steps, generated file trees, or local task lists unless the decision itself is specifically about that externally visible artifact or mandatory platform choice.

An ADR MAY name technologies, frameworks, vendors, protocols, storage systems, deployment platforms, architectural patterns, or organizational constraints when the decision is actually selecting, rejecting, or constraining them.

An ADR MUST identify implementation freedom: what future agents may decide locally without reopening the decision.

An ADR MUST identify revision triggers: facts or outcomes that would make the decision obsolete, unsafe, too costly, or misaligned.

An ADR MUST separate known facts, assumptions, selected constraints, accepted risks, and open questions.

## Normative Language

ADRs MAY use BCP 14 requirement language when future conformance depends on precise constraints.

When normative keywords are used, include this statement or an equivalent near the top of each affected ADR:

> The key words `MUST`, `MUST NOT`, `REQUIRED`, `SHOULD`, `SHOULD NOT`, `RECOMMENDED`, `NOT RECOMMENDED`, `MAY`, and `OPTIONAL` in this document are to be interpreted as described in BCP 14 when, and only when, they appear in all capitals.

Use uppercase requirement keywords only in decision constraints or revision rules. Most ADR prose should be descriptive, not normative.

A `MUST` is justified only when violating the constraint would break the decision.

A `SHOULD` is justified only when the direction is strongly preferred but valid exceptions may exist for documented reasons.

## ADR Set Model

### ADR Index

Create an ADR Index when more than one ADR is produced.

The ADR Index MUST define:

- Decision list.
- Status of each decision.
- Affected boundaries.
- Dependency or sequencing relationships between decisions.
- Decisions that supersede or constrain other decisions.
- Open questions that block accepting one or more decisions.

The ADR Index MUST NOT restate all details from child ADRs.

### Primary ADRs

Each Primary ADR records one durable decision.

Use separate ADRs for distinct decision surfaces such as:

- System boundary or ownership model.
- Data authority and consistency model.
- Integration strategy.
- Runtime or deployment topology.
- Persistence strategy.
- Migration path.
- Security or trust boundary posture.
- Technology or vendor selection.
- Frontend or backend architectural pattern.
- Observability or operational model.
- Agent workflow governance.

The categories above are not required headings. They are splitting cues for independent decisions.

### Superseding ADRs

Do not rewrite history by silently editing an accepted decision into a new decision.

When a decision changes materially, create a new ADR that states:

- Which prior decision is superseded, deprecated, rejected, or amended.
- Why the prior decision no longer holds.
- Which constraints remain valid.
- Which downstream documents or implementations must be reviewed.

## Decision Granularity Rules

Split an ADR when it contains:

- More than one primary decision.
- Multiple unrelated option sets.
- Different decision owners or affected boundaries.
- Different reversibility or migration cost.
- Different security, operational, or compatibility consequences.
- Different validation signals.
- Different revision triggers.
- Detailed behavior that belongs in a contract document.
- A mix of durable decision and temporary implementation task list.

Keep a decision together only when the selected option, rationale, constraints, consequences, and revision triggers cannot be evaluated independently.

## Required ADR Sections

Use the sections that fit the decision. Rename sections when domain language is clearer, but preserve the semantic coverage.

### Header

Each ADR MUST include:

- Title.
- Decision identifier.
- Status: Proposed, Accepted, Superseded, Deprecated, or Rejected.
- Date or version when useful.
- Decision owner when known.
- Affected boundary.
- Related documents when known.
- Supersedes or superseded by when applicable.

### 1. Decision Summary

State the decision in one or two sentences.

The summary should be understandable without reading the whole ADR.

### 2. Context

Describe the situation that made the decision necessary.

Include only known facts, explicit assumptions, and relevant constraints. Do not invent missing context.

Useful context may include:

- Existing system behavior.
- Current pain or risk.
- Compatibility pressure.
- Operational constraints.
- Security constraints.
- Migration constraints.
- Performance or reliability pressure.
- Team or platform constraints.
- Constraints created by prior decisions.

Mark assumptions explicitly. Mark unknowns as open questions when they affect the decision.

### 3. Decision Drivers

List the durable forces that shaped the decision.

Drivers should be evaluable, such as:

- Correctness.
- Safety.
- Maintainability.
- Interoperability.
- Testability.
- Migration cost.
- Runtime constraints.
- Operational burden.
- Security posture.
- Vendor risk.
- Parallel implementation.
- Ability for agents to reason from stable contracts.

Do not add generic drivers that did not influence the decision.

### 4. Options Considered

Compare serious options only.

For each option, include:

- What it is.
- Why it was plausible.
- Strengths.
- Weaknesses.
- Key risk.
- Conditions under which it would have been preferred.

Do not create fake alternatives just to fill the section.

### 5. Decision

Describe the chosen option and why it wins under the stated drivers.

If the decision is provisional, state what must be learned before accepting it permanently.

If the decision rejects an option, make the rejection reason explicit.

### 6. Decision Constraints for Agents

State the constraints future implementation agents must preserve.

Good constraints are architectural, behavioral, or operational:

- Which boundary owns which responsibility.
- Which dependency direction is allowed.
- Which data source is authoritative.
- Which consistency, availability, migration, or compatibility property must hold.
- Which security or privacy property must not be weakened.
- Which platform or technology choice is required or prohibited by the decision.
- Which extension path must remain open.
- Which shortcuts would violate the decision.

Do not turn this section into a coding plan.

### 7. Implementation Freedom

State what agents may still decide without reopening the ADR.

Implementation freedom often includes:

- Local file organization.
- Internal class or function structure.
- Internal data structures.
- Helper abstractions.
- Test helper shape.
- Non-observable refactors.
- Performance optimizations that preserve the decision.
- Library choice within accepted platform constraints.
- Internal naming when not externally visible.

This section is required. Overly strict ADRs cause implementation agents to follow guesses made before implementation details are known.

### 8. Consequences and Tradeoffs

Separate accepted benefits, costs, and risks.

Include consequences such as:

- What becomes simpler.
- What becomes harder.
- Operational burden.
- Migration impact.
- Testing impact.
- Security impact.
- Compatibility impact.
- Performance impact.
- New failure modes.
- Future optionality lost or preserved.

Do not hide material risk in rationale prose.

### 9. Validation Signals

Define how reviewers or agents can tell the decision is working.

Validation signals must be observable. They may include:

- Reduced cross-boundary edits.
- Stable contract tests.
- Fewer duplicated rules.
- Successful migration milestones.
- Lower operational toil.
- Clearer failure ownership.
- Review findings.
- Incident patterns.
- Performance or reliability measurements.
- Implementation agents no longer inventing conflicting ownership models.

Validation signals are not always automated tests, but they must be checkable.

### 10. Revision Triggers

Define what would require revisiting the decision.

Revision triggers may include:

- A rejected option becomes cheaper, safer, or required.
- A selected vendor, framework, protocol, or platform changes materially.
- Implementation requires repeated exceptions.
- The decision creates unplanned coupling.
- Performance, reliability, or security targets are missed.
- Migration cost exceeds the accepted threshold.
- Operational burden becomes disproportionate.
- Security assumptions are invalidated.
- The system grows beyond the decision's original scale.

Revision triggers should be concrete enough that future agents can recognize them.

### 11. Required Follow-up Updates

List documents, contracts, tests, migrations, or operational materials that must be updated because of the decision.

Do not include local implementation task lists. Include only follow-up updates needed to preserve decision consistency.

### 12. Open Questions

List unresolved questions that affect the decision, its constraints, or its validation.

Open questions MUST NOT be hidden as assumptions.

## Constraint Quality Rules

Good ADR constraints:

- Preserve the selected architecture.
- Prevent predictable drift.
- Are stable across implementation details.
- Can be reviewed without reading code.
- Leave local implementation choices open.
- State what would violate the decision.

Weak ADR constraints:

- Dictate incidental file layout.
- Dictate class or function names.
- Dictate helper abstractions.
- Dictate local control flow.
- Freeze package choices that were not part of the decision.
- Encode one possible implementation instead of the architectural property to preserve.

Rewrite weak constraints into durable properties.

## Handling Ambiguity

Do not invent facts to make the decision look complete.

Use one of these strategies:

- Mark an assumption explicitly.
- Add an Open Question when the missing fact affects the decision.
- Define a provisional decision with stated validation requirements.
- Mark a constraint as implementation-defined when multiple choices are acceptable.
- Separate non-normative rationale from binding constraints.

Do not hide assumptions inside option comparisons or consequences.

## Anti-Overreach Rewrite Rules

When tempted to write implementation detail, rewrite it as decision intent:

- Replace file paths with affected boundaries.
- Replace classes or functions with responsibilities.
- Replace local algorithms with architectural properties.
- Replace task lists with required follow-up updates.
- Replace framework API examples with selected capability or platform constraints.
- Replace database schemas with data authority or persistence decisions.
- Replace test implementation details with validation signals.
- Replace exact refactor steps with constraints and migration posture.

## ADR Quality Gate

Before finalizing, verify:

### Decision Shape

- Each ADR records one primary decision.
- Multiple decisions are split into an ADR set.
- The status is clear.
- The affected boundary is clear.
- Supersession relationships are explicit when relevant.

### Rationale Quality

- Context is factual or explicitly marked as assumption.
- Decision drivers are relevant and evaluable.
- Options considered are serious alternatives.
- The chosen option is justified against the stated drivers.
- Rejected options have clear rejection reasons.

### Constraint Quality

- Constraints preserve the decision without over-prescribing local implementation.
- Implementation freedom is explicit.
- Required platform or technology choices are named only when they are part of the decision.
- No hidden task list appears in the ADR.

### Consequence Quality

- Benefits, costs, and risks are separated.
- Migration, operations, testing, security, and compatibility impacts are addressed when relevant.
- New failure modes are identified when introduced.

### Future Safety

- Validation signals are observable.
- Revision triggers are concrete.
- Follow-up document or contract updates are listed when required.
- Open questions are visible.

## Target Output Standard

A high-quality ADR lets future agents preserve a durable decision while still adapting local implementation to facts discovered during coding. It records the reasoning that must survive time, the constraints that prevent architectural drift, the freedom that avoids premature over-specification, and the triggers that make revision safe.
