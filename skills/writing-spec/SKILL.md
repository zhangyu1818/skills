---
name: writing-spec
description: "Use this skill to write language-agnostic, RFC 2119-style system specifications that define behavior through domain models, state machines, boundaries, invariants, failure semantics, validation matrices, and conformance checklists rather than implementation code."
---

# RFC 2119 Declarative SPEC Authoring Skill

## Purpose

Produce a complete `SPEC.md` that can be implemented by independent teams without relying on sample code, framework assumptions, or hidden implementation plans.

The target style is a declarative system blueprint: the document defines what behavior must hold, who owns each state and boundary, how failure is recovered, and how conformance is verified. It should read like a precise architecture contract, not like a tutorial, backlog, README, implementation guide, or coding prompt.

## Style Anchor

- Normative language appears at the top.
- The problem statement defines system purpose and boundaries before components.
- Goals and non-goals constrain scope aggressively.
- Components are described by responsibility, not by classes, files, or frameworks.
- Abstraction layers separate policy, configuration, coordination, execution, integration, and observability.
- Core entities and identifiers are defined before workflows.
- Configuration is specified through resolution, defaults, validation, dynamic reload, and error behavior.
- State machines and transition triggers define the runtime lifecycle.
- Scheduling, retry, reconciliation, and recovery rules are explicit.
- Safety invariants are named and testable.
- External protocols are treated as source-of-truth boundaries instead of being copied wholesale.
- Reference algorithms are late, minimal, language-neutral, and subordinate to the normative text.
- Validation matrices and Definition of Done close the document.

## When to Use

Use this skill when the user asks for any of the following:

- A formal system specification.
- A protocol or runtime contract.
- A product/system architecture SPEC.
- An agent workflow specification.
- A service orchestration spec.
- A spec intended for implementation by another agent or engineering team.

Do not use this skill for ordinary implementation plans, code generation, tickets, API examples, tutorials, or design brainstorming unless the user explicitly asks to convert the result into a formal SPEC.

## Core Principle

Move attention away from “how to implement” and toward:

- What behavior must be true.
- Which entity owns which state.
- Where each boundary begins and ends.
- Which inputs are trusted, normalized, rejected, or passed through.
- Which failures block startup, block dispatch, trigger retry, or require operator intervention.
- Which choices are implementation-defined and must be documented by implementors.
- How an implementation can prove conformance.

## Mandatory Output Contract

The output MUST be a Markdown `SPEC.md` body unless the user asks for another artifact shape.

The SPEC MUST be language-agnostic unless a specific language, runtime, or platform is part of the contract itself.

The SPEC MUST NOT contain implementation code.

The SPEC MUST NOT contain framework-specific implementation plans, package choices, SDK calls, class designs, function bodies, database DDL, shell scripts, generated file trees, or dependency installation instructions.

Inline names for entities, fields, states, events, paths, keys, headers, endpoints, and logical values are allowed when they are part of the specification contract.

The SPEC MAY include late-stage, language-neutral pseudocode only inside a `Reference Algorithms` section, and only when the normative sections are already complete. Pseudocode MUST summarize lifecycle order or state transitions; it MUST NOT become the primary explanation of system behavior.

## Normative Language Rules

The SPEC MUST define RFC 2119 terms near the top.

Use uppercase `MUST`, `MUST NOT`, `REQUIRED`, `SHOULD`, `SHOULD NOT`, `RECOMMENDED`, `MAY`, and `OPTIONAL` only for conformance-relevant behavior.

A `MUST` is justified only when it affects correctness, safety, interoperability, boundary integrity, deterministic behavior, or conformance testing.

A `SHOULD` is justified only when the behavior is strongly preferred but valid implementations may choose otherwise for documented reasons.

A `MAY` or `OPTIONAL` behavior MUST still include its enablement conditions and conformance obligations when implemented.

Define `implementation-defined` as behavior that belongs to the implementation contract but is not universally prescribed by the SPEC. The SPEC MUST require implementors to document implementation-defined choices.

Avoid casual imperative language. Ordinary design guidance should not be written as RFC 2119 requirements.

## Recommended Document Structure Judgment

Include a recommended document structure inside this skill. It is necessary because it prevents the agent from drifting into code snippets and implementation plans.

The structure is a generation scaffold, not a rigid table of contents. A produced SPEC MAY rename, merge, split, or omit sections when the domain requires it, but it MUST preserve the underlying semantic coverage: problem, goals, non-goals, components, abstraction layers, domain model, identifiers, primary contract, configuration, state machine, processing rules, resources, integrations, observability, failure model, security, reference algorithms, validation matrix, and Definition of Done.

Do not emit a section literally titled “Recommended Document Structure” in the final SPEC unless the user asks for a template. Emit the actual SPEC.

## Recommended Document Structure

### Header

Include:

- Title: `[System Name] Specification`.
- Status: draft, stable, experimental, or versioned release state.
- Purpose: one sentence defining what this specification controls.

### Normative Language

Define RFC 2119 terms and `implementation-defined`.

### 1. Problem Statement

Define:

- What the system is.
- What problem it solves.
- What operational boundary it owns.
- What it explicitly does not own.
- What counts as a successful run, handoff, transaction, or lifecycle completion.

The problem statement should include an “Important boundary” paragraph when the system coordinates other actors, tools, users, agents, protocols, or services.

### 2. Goals and Non-Goals

Goals MUST be observable and testable.

Non-goals MUST prevent scope creep. They should exclude tempting but incorrect expansions, such as full control planes, general-purpose workflow engines, built-in business logic, unnecessary UI commitments, hardcoded security posture, or unrelated integrations.

### 3. System Overview

Define components by responsibility only.

For each component, specify:

- What it owns.
- What it consumes.
- What it emits.
- What it MUST NOT own.

Then define abstraction layers. Typical layers include:

- Policy Layer.
- Configuration Layer.
- Coordination Layer.
- Execution Layer.
- Integration Layer.
- Observability Layer.
- Security or Resource Layer when relevant.

Layers are conceptual boundaries, not code directories.

### 4. Core Domain Model

Define stable entities before describing flows.

For each entity, include:

- Purpose.
- Fields.
- Logical type.
- REQUIRED or OPTIONAL status.
- Default value when applicable.
- Normalization rules.
- Identifier rules.
- Lifecycle owner.
- Whether it is durable, derived, external, or runtime-only.

Entities often include:

- Work item, request, issue, task, job, session, attempt, claim, workspace, resource, configuration object, external object, error object, and runtime state.

### 5. Stable Identifiers and Normalization Rules

Define:

- Internal IDs.
- External IDs.
- Human-readable IDs.
- Derived keys.
- Path or name sanitization.
- Case folding.
- Unknown value handling.
- Sort stability.
- Timestamp normalization.
- Null, missing, and empty-value semantics.

### 6. Primary System Contract

Name this section according to the domain, such as Workflow Specification, Runtime Contract, Repository Contract, Protocol Contract, Policy Contract, File Format Contract, or Scheduler Contract.

Define:

- Discovery rules.
- Source of truth.
- Format rules.
- Schema or field rules.
- Defaults.
- Validation.
- Unknown field behavior.
- Extension points.
- Fallback behavior.
- Dynamic reload or change-application behavior when relevant.

### 7. Configuration Specification

Define the configuration resolution pipeline in ordered steps:

- Select source.
- Parse raw data.
- Apply defaults.
- Resolve environment or external references only when explicitly configured.
- Normalize paths, names, identifiers, or protocol values.
- Coerce logical types.
- Validate.
- Produce the effective typed view.

Define:

- Startup validation.
- Per-run or per-tick validation.
- Dynamic reload semantics.
- Last-known-good behavior for invalid reloads.
- Blocking and non-blocking validation failures.
- A compact config field summary.

### 8. State Machine

Define the authoritative state owner before listing states.

For each state, specify:

- Meaning.
- Enter conditions.
- Exit conditions.
- Allowed transitions.
- Triggering events.
- Terminal reasons.
- Retry or recovery semantics.

Define separate state machines when needed for:

- System lifecycle.
- Work item lifecycle.
- Run attempt lifecycle.
- Session lifecycle.
- Resource lifecycle.

### 9. Processing, Scheduling, or Execution Rules

Choose the heading that matches the system.

Define:

- Candidate selection.
- Eligibility rules.
- Sorting or priority rules.
- Claiming or deduplication rules.
- Concurrency limits.
- Backoff and retry.
- Timeout handling.
- Reconciliation.
- Cleanup.
- Handoff.
- Idempotency.
- Restart behavior.

Rules should be declarative. Do not explain them through implementation loops unless repeated behavior cannot be understood without a late reference algorithm.

### 10. Resource Management and Safety

Define:

- Resource layout.
- Resource ownership.
- Creation, reuse, retention, and deletion rules.
- Cleanup triggers.
- Destructive operation policy.
- Permission assumptions.
- Path or namespace containment.
- Operator intervention points.

Include named Safety Invariants. Each invariant MUST be testable.

### 11. Integration Contracts

For every external dependency or protocol, define:

- Source of truth.
- Required operations.
- Data normalization.
- Error categories.
- Retry behavior.
- Write boundary.
- Drift behavior.
- Whether the integration is REQUIRED, OPTIONAL, or implementation-defined.

Do not copy an external protocol schema unless the SPEC owns that schema. State that the external protocol controls protocol shape when appropriate, and define only the system-specific obligations around it.

### 12. Prompt, Input, or Context Assembly Contract

Use this section when the system involves agents, LLMs, prompts, templates, context bundles, user input, or generated instructions.

Define:

- Input sources.
- Rendering variables.
- Strict or permissive rendering behavior.
- Unknown variable handling.
- Unknown filter or transformation handling.
- Retry and continuation semantics.
- Fallback prompt policy.
- Context minimization.
- Sensitive data handling.

Do not include few-shot code examples.

### 13. Observability

Define:

- Required logs.
- Required context fields.
- Stable message conventions.
- Metrics.
- Runtime snapshots.
- Status surfaces.
- Optional dashboards or APIs.
- Whether observability failures affect correctness.

Observability MUST NOT become a hidden dependency for core correctness unless the system is itself an observability system.

### 14. Failure Model and Recovery Strategy

Classify failures by source.

For each failure class, specify:

- Whether it blocks startup.
- Whether it blocks new work.
- Whether it stops active work.
- Whether it triggers retry.
- Whether it uses backoff.
- Whether it releases claims.
- Whether it requires operator intervention.
- What must be logged or surfaced.

Include restart recovery semantics. Specify what is restored, what is not restored, and which external or durable state is used to recover.

### 15. Security and Operational Safety

Define:

- Trust boundary assumptions.
- Secret handling.
- Least privilege guidance.
- Sandbox or approval posture.
- Unsafe input classes.
- What MUST NOT be logged.
- What implementors MUST document.
- Which controls are REQUIRED for conformance and which are deployment-specific hardening.

### 16. Reference Algorithms

Include only when useful.

Allowed content:

- Startup sequence.
- Dispatch or processing tick.
- Reconciliation.
- Retry scheduling.
- State transition summary.
- Cleanup summary.

Disallowed content:

- Real language syntax.
- SDK calls.
- Framework code.
- Data access code.
- Shell commands.
- Class or function implementation details.

The reference algorithm is non-primary. It should summarize the already-defined rules.

### 17. Test and Validation Matrix

Define conformance profiles, such as:

- Core Conformance.
- Extension Conformance.
- Real Integration Profile.
- Production Readiness Profile.

List pass/fail checks by domain:

- Configuration.
- Domain model and normalization.
- State transitions.
- Processing, scheduling, retry, and recovery.
- Resource safety.
- Integration contracts.
- Observability.
- Security invariants.
- Restart recovery.

### 18. Implementation Checklist / Definition of Done

Separate:

- REQUIRED for conformance.
- RECOMMENDED for robust operation.
- OPTIONAL extensions.
- Production readiness checks.

The checklist should be redundant with the spec by design. It makes the SPEC executable by humans and agents.

### Appendices

Use appendices only for optional extension profiles, migration notes, non-normative rationale, or implementation-defined examples.

Appendices MUST NOT silently modify core conformance.

## Authoring Process

Follow this order:

1. Extract the system boundary and source-of-truth relationships.
2. Identify the core domain entities and their stable identifiers.
3. Define ownership of mutable state.
4. Define lifecycle states and transition triggers.
5. Define configuration and dynamic change semantics.
6. Define processing rules, eligibility, retries, and reconciliation.
7. Define resource boundaries and safety invariants.
8. Define external integration contracts and drift behavior.
9. Define observability and failure recovery.
10. Define security posture and implementation-defined hardening.
11. Add reference algorithms only after the normative model is complete.
12. Add validation matrix and Definition of Done.
13. Remove implementation code and framework-specific decisions.

## Handling Ambiguity

If required facts are missing, do not invent concrete implementation details.

Use one of these strategies:

- Mark the behavior as `implementation-defined` when multiple conforming policies are valid.
- Add an explicit Open Question when the missing fact affects conformance.
- Define a minimal safe default only when the default is necessary and defensible from the system purpose.
- Separate normative behavior from non-normative rationale.

Do not hide assumptions inside examples.

## Anti-Code Rewrite Rules

When tempted to write code, replace it as follows:

- Replace data structure code with entity field definitions.
- Replace functions with component responsibilities and transition rules.
- Replace loops with scheduling, eligibility, retry, or reconciliation rules.
- Replace conditionals with state transition tables or failure semantics.
- Replace try/catch examples with failure classes and recovery behavior.
- Replace database schemas with logical persistence contracts.
- Replace API client examples with integration operations and source-of-truth rules.
- Replace tests with validation matrix items.
- Replace implementation diagrams with component responsibility boundaries.

## SPEC Quality Gate

Before finalizing, verify that the SPEC satisfies all checks below.

### Code Exclusion

- No real implementation code.
- No SDK calls.
- No framework choices unless contractually required.
- No database DDL unless the database schema is the specified artifact.
- No install commands.
- No file-tree implementation plan.

### Formal Model

- Core entities are named and field-defined.
- Stable identifiers and normalization rules exist.
- Mutable state has a single owner where needed.
- State machines include states, transitions, triggers, and terminal reasons.
- Configuration includes defaults, validation, reload behavior, and invalid-change handling.
- External integrations declare source of truth and drift behavior.

### Boundary Strength

- Every major component has owned and non-owned responsibilities.
- Non-goals prevent predictable scope creep.
- Optional features have enablement and conformance rules.
- Implementation-defined choices require documentation.

### Recovery and Safety

- Failure classes are explicit.
- Recovery behavior is defined per failure class.
- Restart recovery is defined.
- Safety invariants are named and testable.
- Secret and unsafe-input handling are addressed.

### Verifiability

- Test matrix has pass/fail checks.
- Definition of Done maps back to normative sections.
- The SPEC could guide an implementation without requiring the author to explain missing behavior verbally.

## Target Output Standard

A high-quality output from this skill should make an implementation agent behave as if it received a precise system blueprint. The agent should be able to implement, test, and audit conformance from the SPEC alone, while still documenting implementation-defined choices instead of guessing hidden requirements.
