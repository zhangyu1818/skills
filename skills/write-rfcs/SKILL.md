---
name: write-rfcs
description: "Produce BCP 14-style RFC sets that define behavior, boundaries, state ownership, failure semantics, invariants, and conformance gates without implementation code, file-layout constraints, framework choices, or hidden glue behavior."
---

# RFC Set Authoring Skill

## Purpose

Create a set of RFC-style Markdown documents that define a system, feature, workflow, protocol, or integration through contracts rather than implementation plans.

The output is an RFC set. It is decomposed into small, independently reviewable and independently testable documents so multiple implementation agents can work in parallel without inventing incompatible behavior.

The RFC set defines:

- Required behavior.
- Owned boundaries.
- Source-of-truth relationships.
- State ownership and transitions.
- Stable identifiers and normalization rules.
- Inputs, outputs, events, commands, and externally visible resources.
- Failure categories and recovery rules.
- Safety, compatibility, and extension invariants.
- Conformance checks that prove an implementation stayed inside the contract.

The RFC set does not define incidental implementation details. It must leave implementation agents free to choose local code structure, file organization, internal names, frameworks, and algorithms unless those choices are part of an externally visible contract.

Generated documents should contain only information needed by implementors, reviewers, and conformance checks.

## Output Contract

Output multiple RFCs by default. Do not collapse the work into a single long document unless the user explicitly requests a single artifact.

An RFC set MUST include:

1. An RFC Map.
2. One or more Contract or Protocol RFCs.
3. One or more Capability RFCs when implementation can be split by independently testable responsibility.
4. One or more Composition RFCs when multiple capabilities must combine into an end-to-end behavior.
5. A Conformance RFC only when cross-document validation is large enough to distract from the individual RFCs.

The output MAY be delivered as multiple Markdown files, a Markdown bundle with clearly separated RFCs, or an artifact package, depending on the requested artifact shape.

Each RFC MUST have a stable document identifier for traceability. Document identifiers are planning artifact identifiers only; they MUST NOT imply implementation file names, module names, package names, directory names, class names, or function names.

Generated RFCs MUST NOT contain implementation code.

Generated RFCs MUST NOT prescribe implementation file names, code directories, package names, class names, function names, framework APIs, SDK calls, database DDL, shell commands, dependency installation steps, generated file trees, or local task lists unless the named item is itself the external contract being specified.

Generated RFCs MAY name domain entities, logical fields, states, events, commands, externally visible endpoints, message names, configuration keys, roles, identifiers, user-facing labels, and protocol values when they are part of the contract.

Generated RFCs MAY include language-neutral pseudocode only inside a Reference Flow or Reference Algorithm section, and only after the normative behavior has already been defined. Pseudocode MUST summarize lifecycle order, decision order, or state transitions. It MUST NOT become the primary explanation of behavior.

## Normative Language

Generated RFCs SHOULD use BCP 14 requirement language when conformance depends on precise requirements.

When normative keywords are used, include this statement or an equivalent near the top of each affected RFC:

> The key words `MUST`, `MUST NOT`, `REQUIRED`, `SHOULD`, `SHOULD NOT`, `RECOMMENDED`, `NOT RECOMMENDED`, `MAY`, and `OPTIONAL` in this document are to be interpreted as described in BCP 14 when, and only when, they appear in all capitals.

Use uppercase requirement keywords only for conformance-relevant behavior.

A `MUST` is justified only when it affects correctness, safety, interoperability, deterministic behavior, security boundary integrity, compatibility, testability, or state consistency.

A `SHOULD` is justified only when the behavior is strongly preferred but valid implementations may choose otherwise for documented reasons.

A `MAY` or `OPTIONAL` behavior still needs enablement conditions, compatibility expectations, and conformance obligations when implemented.

Define `implementation-defined` as behavior that belongs to the implementation contract but is intentionally not standardized by the RFC. Generated RFCs MUST require implementors to document implementation-defined choices that affect behavior, testing, operations, security, compatibility, or interoperability.

## RFC Set Decomposition Model

### RFC Map

The RFC Map is the index and dependency graph. It prevents downstream documents from drifting away from the intended decomposition.

The RFC Map MUST define:

- System or feature intent.
- User-visible outcome.
- RFC decomposition.
- Layer for each RFC.
- Boundary owned by each RFC.
- Dependencies between RFCs.
- Parallel implementation groups.
- Contract freeze points.
- Required conformance gates.
- Blocking open questions.

The RFC Map MUST NOT restate all child requirements. It should identify where each requirement family belongs.

### Contract and Protocol RFCs

Contract and Protocol RFCs define shared truth. They are the upstream layer that allows independent capabilities to be implemented in parallel.

Create separate Contract or Protocol RFCs for distinct contract surfaces such as:

- Domain vocabulary and entity model.
- Stable identifiers and normalization.
- Source-of-truth and state ownership.
- Lifecycle state machines.
- Public events, commands, messages, or protocol operations.
- Validation, error categories, and recovery semantics.
- Compatibility, versioning, and extension behavior.
- Trust boundaries, authorization assumptions, and unsafe input handling.
- Logical persistence expectations when durable state is externally observable.
- Contract fixtures and cross-boundary acceptance scenarios.

A Contract RFC MUST be understandable without reading a Capability RFC.

A Contract RFC MUST NOT depend on a Capability RFC.

A Contract RFC MUST define enough fixtures, tables, examples, or acceptance scenarios to let downstream capabilities test against the contract without asking another capability for hidden behavior.

### Capability RFCs

Capability RFCs define independently implementable and independently testable responsibilities.

Create one Capability RFC per bounded capability. Split again when a capability owns more than one mutable state area, contains more than one external boundary, or has more than one independent conformance surface.

A Capability RFC MUST define:

- Owned responsibility.
- Upstream contracts consumed.
- Outputs, events, commands, or state changes emitted back to contracts.
- Local state owned by the capability.
- Inputs accepted and inputs rejected.
- Local lifecycle or processing rules.
- Concurrency, idempotency, retry, and restart behavior when relevant.
- External dependencies used by the capability.
- Local failure handling.
- Observability obligations relevant to the capability.
- Capability-level conformance checks.
- Implementation-defined choices that must be documented.

A Capability RFC MUST NOT introduce new cross-boundary semantics. If the capability needs a new shared rule, amend or create the relevant Contract RFC first.

A Capability RFC SHOULD be testable with contract fixtures, mocks, simulators, deterministic scenarios, or externally observable behavior defined by upstream contracts.

### Composition RFCs

Composition RFCs define how accepted capabilities combine into an end-to-end feature.

A Composition RFC MUST define:

- End-to-end flow.
- Capability ordering.
- Handoff points.
- Completion semantics.
- Cross-capability failure behavior.
- Recovery and retry behavior across boundaries.
- User-visible success, partial success, cancellation, and failure semantics.
- Integration acceptance tests.
- Rollout or compatibility sequencing when relevant.

A Composition RFC MUST compose only through accepted contracts and named capability boundaries.

A Composition RFC MUST NOT invent glue behavior, hidden adapters, implicit conversions, unowned state, or new data semantics. If conversion or orchestration behavior is required, it MUST already be defined in a Contract RFC or in a named Capability RFC with explicit ownership.

### Conformance RFCs

Create a separate Conformance RFC when validation crosses many documents or would make the other RFCs hard to review.

A Conformance RFC MAY define:

- Cross-RFC trace matrix.
- Contract fixtures.
- Required acceptance scenarios.
- Negative tests.
- Race, restart, retry, and idempotency tests.
- Compatibility tests.
- Security and safety checks.
- Parallel implementation merge gates.
- Regression checks for amended contracts.

Small RFC sets SHOULD keep conformance sections inside the individual RFCs instead of creating a separate document.

## Splitting Rules

Split aggressively around boundaries that can be implemented or tested independently.

Split an RFC when it contains:

- More than one source-of-truth relationship.
- More than one mutable state owner.
- More than one external protocol or integration boundary.
- More than one independently testable capability.
- Both upstream contract semantics and downstream implementation behavior.
- Both local component behavior and end-to-end composition behavior.
- Both normative requirements and large conformance fixture catalogs.
- Both security/trust boundary rules and unrelated feature behavior.
- Both migration/compatibility policy and unrelated runtime behavior.

Keep an RFC together only when the requirements share the same owner, lifecycle, state model, and conformance gate.

Each RFC should be small enough to load with its direct dependencies in an implementation agent's active context. Use dependency references instead of copying upstream text into every downstream RFC.

## Layer Dependency Rules

The dependency graph MUST flow in this order:

1. Known project constraints.
2. RFC Map.
3. Contract or Protocol RFCs.
4. Capability RFCs.
5. Composition RFCs.
6. Conformance or rollout RFCs when separated.

A downstream RFC MUST NOT silently redefine an upstream contract.

A downstream RFC MUST reference upstream contracts by document identifier and section name when it depends on them.

If implementation discovery invalidates an upstream RFC, amend the upstream RFC first, then update downstream RFCs. Do not patch around the mismatch in component prose or composition prose.

## Contract Correctness Gate

Contract RFCs must pass the Contract Correctness Gate before Capability RFCs are treated as safe for parallel implementation.

A Contract RFC passes the gate only when the following checks are satisfied:

### Vocabulary Closure

- Core terms are defined once.
- Synonyms are avoided or explicitly normalized.
- Domain entities are named before workflows depend on them.
- Each logical field has a purpose, type expectation, required or optional status, default behavior if applicable, and missing-value semantics.

### Boundary Closure

- Each input source is named.
- Each output destination is named.
- Each external dependency is classified as authoritative, advisory, derived, cached, or implementation-defined.
- Trust boundaries are explicit.
- Unknown, malformed, duplicate, stale, and out-of-order inputs have defined behavior.

### Ownership Closure

- Every mutable state has exactly one authoritative owner or an explicit conflict-resolution rule.
- Derived state identifies its source.
- Cached state identifies invalidation and staleness behavior.
- Durable state and runtime-only state are separated.
- No state is implicitly shared between capabilities.

### Identifier and Normalization Closure

- Stable identifiers are defined.
- External identifiers and internal identifiers are distinguished.
- Case folding, whitespace handling, timestamp handling, path or namespace normalization, null handling, and unknown value handling are defined when relevant.
- Sort order and tie-break behavior are defined when deterministic behavior matters.

### Lifecycle Closure

- State machines define states, entry conditions, exit conditions, allowed transitions, triggering events, terminal reasons, retry behavior, and recovery behavior.
- Forbidden transitions are either explicitly listed or covered by a default rejection rule.
- Restart recovery behavior is defined for durable and in-flight states.

### Failure Closure

- Failure classes are named.
- Each failure class defines whether it blocks startup, blocks new work, stops active work, triggers retry, uses backoff, releases claims, requires operator intervention, or is surfaced to users.
- Partial success and cancellation semantics are defined when relevant.

### Compatibility Closure

- Unknown field behavior is defined.
- Extension points are named.
- Version negotiation or compatibility behavior is defined when multiple producers or consumers may coexist.
- Backward-incompatible change rules are explicit.

### Testability Closure

- The RFC includes enough fixtures, scenarios, tables, or expected outcomes to test the contract without relying on hidden intent.
- Positive, negative, boundary, restart, retry, idempotency, and drift scenarios are covered when relevant.
- Each invariant is named and testable.
- Open questions that block safe implementation are clearly marked and not buried in prose.

### Parallelization Closure

- Each downstream capability can declare its consumed inputs and produced outputs using only accepted contract terms.
- No downstream capability must wait for another downstream capability to define shared semantics.
- Shared transformations are owned by a contract or by a named capability with explicit input and output contracts.

If any closure check fails, revise the Contract RFC before generating or accepting dependent Capability RFCs.

## Parallel Development Rules

Parallel implementation is safe only after the relevant Contract RFCs pass the Contract Correctness Gate.

Each Capability RFC MUST include an Implementation Independence section that declares:

- Direct upstream RFC dependencies.
- Owned local state.
- Inputs it consumes.
- Outputs it emits.
- External systems it reads or writes.
- Required fixtures, mocks, simulators, or deterministic scenarios.
- Conformance checks for isolated testing.
- Behavior explicitly outside its boundary.
- Assumptions that remain implementation-defined.
- Open questions that block safe implementation.

Two Capability RFCs may be implemented in parallel when:

- They depend only on accepted upstream contracts.
- They do not own the same mutable state.
- They do not require unaccepted behavior from each other.
- Their integration occurs through a Composition RFC or accepted upstream contract.
- Their conformance checks can be run independently before integration.

When two capabilities need a new shared rule, add or amend a Contract RFC instead of creating an implicit implementation convention.

## No-Glue Composition Rule

Composition must not rely on unnamed glue behavior.

A Composition RFC MUST reject any required behavior that has no owner in the RFC set.

A conversion, adapter, mapper, bridge, orchestrator, scheduler, or coordinator is allowed only when it is one of the following:

- Defined by a Contract RFC as part of the shared protocol.
- Defined by a Capability RFC as an owned capability with inputs, outputs, failure behavior, and conformance checks.
- Declared implementation-defined because it is not externally visible and cannot affect correctness, safety, interoperability, or conformance.

A Composition RFC MUST NOT use phrases such as "wire it together", "add a thin adapter", "just map the fields", "handle the mismatch", or "glue layer" unless the behavior is immediately assigned to a contract or capability with testable obligations.

## Required RFC Sections

Use the sections that match the RFC layer. Rename sections when domain language is clearer, but preserve the semantic coverage.

### Common Header

Each RFC MUST include:

- Title.
- Document identifier.
- Status.
- Layer.
- Owned boundary.
- Depends on.
- Provides.
- Non-normative summary.
- Normative language statement when BCP 14 keywords are used.

### Common Scope Section

Define:

- What this RFC owns.
- What this RFC does not own.
- Which upstream documents it depends on.
- Which downstream documents may depend on it.
- Which implementation choices remain outside the RFC.

### RFC Map Sections

Include:

- Intent.
- User-visible outcome.
- Decomposition table.
- Dependency graph.
- Parallel implementation groups.
- Contract freeze sequence.
- Conformance gate summary.
- Blocking open questions.

The decomposition table should include document identifier, layer, owned boundary, provided contract or capability, dependencies, parallelization group, and conformance gate.

### Contract RFC Sections

Include the relevant sections:

- Domain vocabulary.
- Entity model.
- Stable identifiers.
- Source-of-truth rules.
- Boundary inputs and outputs.
- State ownership.
- State machines.
- Events, commands, messages, or protocol operations.
- Validation and normalization rules.
- Error categories and recovery rules.
- Compatibility and extension rules.
- Trust and safety rules.
- Contract fixtures or acceptance scenarios.
- Contract Correctness Gate checklist.
- Open questions.

### Capability RFC Sections

Include the relevant sections:

- Capability responsibility.
- Consumed contracts.
- Produced outputs.
- Owned local state.
- Processing rules.
- Local state transitions.
- Eligibility and rejection rules.
- Concurrency and idempotency.
- Retry, timeout, restart, and reconciliation behavior.
- External dependencies.
- Observability obligations.
- Implementation Independence section.
- Capability conformance checks.
- Open questions.

### Composition RFC Sections

Include the relevant sections:

- End-to-end intent.
- Participating contracts and capabilities.
- Flow stages.
- Handoff points.
- User-visible completion semantics.
- Cross-capability failure behavior.
- Retry and recovery across boundaries.
- Compatibility and rollout sequencing.
- No-Glue Composition checklist.
- Integration conformance checks.
- Open questions.

### Conformance RFC Sections

Include the relevant sections:

- Conformance profiles.
- Cross-RFC trace matrix.
- Contract fixtures.
- Capability test fixtures.
- Integration scenarios.
- Negative scenarios.
- Restart, race, retry, and idempotency scenarios.
- Security and safety checks.
- Merge gates for parallel implementations.
- Regression gates for amended contracts.

## Reference Flows and Pseudocode

Use reference flows when prose and tables are not enough to communicate ordering.

Allowed:

- Lifecycle order.
- State transition summary.
- Scheduling order.
- Retry and reconciliation sequence.
- Validation decision order.
- Composition flow.

Disallowed:

- Real programming language syntax.
- SDK calls.
- Framework APIs.
- Database access code.
- Shell commands.
- Class or function bodies.
- File paths that are not externally visible contract values.

Reference flows are non-primary. The normative requirements must already be complete without them.

## Handling Ambiguity

Do not invent concrete implementation details when required facts are missing.

Use one of these strategies:

- Mark behavior as `implementation-defined` when multiple conforming policies are valid.
- Add an explicit Open Question when the missing fact affects conformance.
- Define a minimal safe default only when the default is necessary and defensible from the system purpose.
- Separate normative requirements from non-normative rationale.
- Keep assumptions visible and traceable to the affected RFC sections.

Do not hide assumptions inside examples, pseudocode, or conformance fixtures.

## Anti-Drift Rewrite Rules

When tempted to write implementation detail, rewrite it as a contract requirement:

- Replace file trees with owned boundaries and artifact responsibilities.
- Replace data structure code with logical entity fields and normalization rules.
- Replace functions with component responsibilities, inputs, outputs, and state transitions.
- Replace loops with scheduling, eligibility, retry, or reconciliation rules.
- Replace conditionals with state transition tables, validation rules, or failure semantics.
- Replace try/catch examples with failure classes and recovery obligations.
- Replace database schemas with logical persistence contracts.
- Replace API client examples with integration operations and source-of-truth rules.
- Replace tests with conformance scenarios and pass/fail expectations.
- Replace integration prose with named contracts, named capabilities, or explicit implementation-defined behavior.

## RFC Set Quality Gate

Before finalizing the RFC set, verify:

### Decomposition

- The output is split into multiple RFCs unless a single artifact was explicitly requested.
- The RFC Map identifies all documents, dependencies, and parallel groups.
- Contract RFCs are upstream of Capability RFCs.
- Composition RFCs depend on accepted contracts and named capabilities.
- Large cross-document validation is isolated in a Conformance RFC when needed.

### Contract Correctness

- Core vocabulary is closed.
- Boundaries are explicit.
- Source-of-truth relationships are named.
- Mutable state has a single owner or conflict-resolution rule.
- Stable identifiers and normalization rules exist.
- State machines include states, transitions, triggers, and terminal reasons.
- Failure classes and recovery behavior are defined.
- Compatibility and extension behavior are defined.
- Contract fixtures or acceptance scenarios exist.

### Parallel Implementability

- Each Capability RFC can be implemented and tested in isolation.
- No Capability RFC invents cross-boundary semantics.
- Shared transformations have explicit ownership.
- No two parallel capabilities own the same mutable state.
- Blocking open questions are visible.

### Composition Integrity

- End-to-end behavior composes through accepted contracts.
- No hidden adapters, implicit conversions, or unnamed glue behavior are required.
- Completion, failure, cancellation, and recovery semantics are user-visible when relevant.
- Integration tests map back to contract and capability conformance checks.

### Implementation Freedom

- No implementation code is present.
- No local file layout, class design, function design, framework API, SDK call, package choice, database DDL, or installation command is prescribed unless externally contractual.
- Implementation-defined choices are documented instead of guessed.

## Target Output Standard

A high-quality RFC set lets implementation agents work independently while converging on the same observable behavior. Contract RFCs make shared semantics explicit, Capability RFCs make isolated implementation safe, Composition RFCs assemble behavior without hidden glue, and Conformance gates make drift detectable before integration.
