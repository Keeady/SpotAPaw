# Pet Sighting Pipeline: Phased Rollout Plan

> Companion doc to [`pet-sighting-architecture-review.md`](./pet-sighting-architecture-review.md), which covers the current vs. proposed architecture. This doc tracks the *rollout* — status, implementation notes, and follow-ups per phase, updated as work actually happens.

**How to use this doc:** each phase below has a `Status` line and three sections — `Plan`, `Implementation`, `Follow-up / Learnings` — kept side by side rather than overwritten, so the plan-vs-reality gap stays visible as phases complete. Update `Status` as phases move, and append to `Implementation` / `Follow-up` rather than editing the `Plan` retroactively.

**Status legend:** 🔲 Not started · 🟡 In progress · ✅ Complete · ⏸️ Paused / blocked

---

## Phase 1 — Baseline observability on the current system

**Status:** 🟡 In progress

### Plan
Instrument the *existing* trigger-based pipeline before changing any architecture, so later decisions are backed by real numbers and there's a genuine before/after comparison once the migration lands.

**What to measure:**

| Metric | Why it matters |
|---|---|
| Trigger execution duration (p50/p95/p99), per downstream action | Quantifies how much of insert latency each action actually contributes |
| End-to-end latency: insert → notified / insert → matched / insert → poster ready | The real user-facing numbers we're trying to improve |
| Failure rate per downstream action | Currently invisible — trigger failures are silent today |
| Fan-out size distribution (subscribers per sighting within radius) | Real throughput requirements, not guesses — drives the pgmq-vs-external-queue decision in Phase 2 |
| Sightings/sec at peak vs. average | Baseline load for capacity planning |
| External API latency + error rate (embedding API, image-gen API) | Separates "our code is slow" from "the vendor is slow" |
| DB-side cost of the trigger chain on insert latency | Is the write path itself already being slowed down today? |

**Concrete implementation plan:**

- Add an `events_log` table: `(sighting_id, action, status, started_at, completed_at, error_message)`. Wrap each existing trigger action with a lightweight insert into this table.
- Log fan-out size per sighting (`COUNT(*)` from the `ST_DWithin` match) into `events_log`.
- Use `pg_stat_statements` and Supabase's Postgres logs for trigger execution time without app-level instrumentation.
- Feed `events_log` into a dashboard (Grafana, Metabase, or a scheduled query).
- Run for a defined window (1–2 weeks, or N sightings) spanning at least one peak period.

### Implementation

#### Overview

This document describes the instrumentation strategy for tracking feed-related
requests end-to-end, from the moment a client initiates a request to backend
completion. The goal is to capture enough signal to diagnose latency, failures,
and user impact without coupling telemetry logic to business logic.

#### Design Decision: Reporting Mechanism

Two approaches were considered for how the client reports timing data to the
backend.

##### Option 1 — Piggyback on the existing request

Attach telemetry metadata (`started_at`, `correlation_id`) to the existing feed
request payload, then send a follow-up update once the request completes or
fails on the client.

- **Pros:** No new endpoint required; minimal frontend surface area change.
- **Cons:** Requires a second call from the client to report completion,
  meaning telemetry state is split across two request/response cycles tied to
  the same business call.

##### Option 2 — Dedicated telemetry endpoint

Send telemetry data to the backend via a separate, purpose-built endpoint,
decoupled from the business request entirely.

- **Pros:** Client-measured completion time is accurate and independent of the
  business response payload; telemetry can evolve without touching business
  endpoints.
- **Cons:** Requires new backend endpoints and additional network calls from
  the client.

#### Recommendation

**Option 2** is the preferred approach. Instrumentation and business logic
should be decoupled because they evolve on different cadences and are owned by
different concerns — a change to how a sighting is fetched should not require
touching how that fetch is measured, and vice versa. This also keeps the
instrumentation contract consistent across both the frontend and backend,
since the backend independently emits its own telemetry steps for the same
`correlation_id` regardless of how the client reports its side.

#### Event Aggregation Strategy

Rather than emitting a new telemetry event per step, all steps for a given
request are aggregated into a **single event**, keyed by `event` name and
`correlation_id`. Each step updates the same event record rather than creating
a new row, which keeps event volume proportional to requests rather than to
requests × steps.

#### Questions This Telemetry Answers

- How long does the request take, end-to-end?
- Which stage of the request lifecycle is slow?
- Why did the request fail?
- Where in the pipeline did it fail?
- When did failures start trending?
- What type of users are affected?
- How many users are affected?
- What errors are occurring and how often?

#### Telemetry Steps

Each event progresses through the following steps, representing the full
client → server → client round trip:

| Step | Description |
|---|---|
| `request_start` | Client begins preparing the request |
| `request_sent` | Client dispatches the request over the network |
| `request_received` | Backend receives the request |
| `request_queued` | Backend queues the request for processing |
| `request_task_start` | Backend begins processing the task |
| `request_task_completed` | Backend finishes processing the task |
| `request_response_sent` | Backend sends the response |
| `request_response_received` | Client receives the response |
| `request_completed` | Client finishes handling the response (success or failure) |

#### Telemetry Payload Schema

| Field | Description |
|---|---|
| `correlation_id` | Unique ID tying all steps of a single request together |
| `event` | Event name (see Events below) |
| `step` | Current step in the request lifecycle (see Telemetry Steps) |
| `started_at` | Timestamp when this step began |
| `completed_at` | Timestamp when this step completed |
| `count` | Number of occurrences, for batched/aggregated steps |
| `duration_ms` | Duration of this step, in milliseconds |
| `error_message` | Error detail, if the step failed |
| `status` | Outcome of the step (e.g. success, failure) |
| `data` | Free-form object for additional business context (see below) |
| `error_type` | Error category to help categorizing and tracking errors overtime |

#### `data` Field

To avoid schema growth from adding a new column for every new dimension we
want to track, supplementary business context is stored in a flexible `data`
object rather than as first-class fields:

- `user_type`
- `is_ai_enabled`
- `count`
- `error_message`

#### Events

| Event | Trigger |
|---|---|
| `sighting_list_event` | Populating the nearby sighting feed on app open or navigation |
| `sighting_detail_event` | User opens a sighting's detail page from the feed |
| `sighting_photo_upload_event` | User uploads a photo with AI enabled; tracks the external AI dependency and photo processing pipeline |
| `sighting_create_event` | User submits a new sighting; tracks all downstream dependencies |

### Follow-up / Learnings

_(To be filled in once the baseline window completes — actual numbers observed, any surprises, anything that changes the plan for later phases.)_

---

## Phase 2 — Architecture decision: pgmq

**Status:** 🔲 Not started
**Depends on:** Phase 1 baseline numbers (particularly fan-out size and sightings/sec)

### Plan
Formalize the queue choice as an explicit decision record rather than an assumption.

| Option | Infra cost | Migration effort | Throughput ceiling | Notes |
|---|---|---|---|---|
| **pgmq** | None — already Postgres/Supabase | Low — SQL extension, no new service | Table-backed, thousands/sec realistic, needs partitioning/tuning at very high volume | Chosen |
| SQS / Cloud Tasks | New AWS/GCP account, IAM, networking | Medium-high | Effectively unbounded | Better long-term ceiling, real infra lift now |
| Kafka | Significant — cluster to run/manage | High | Very high, plus ordering/replay guarantees | Overkill for current scale, real ops burden |
| Edge Functions + `pg_notify` | None | Low | Fragile — no durable queue semantics | Rejected — no retry/redelivery guarantee |

**Decision:** pgmq, given the Supabase-only infra constraint and that a new queueing service isn't justified by current load. Explicitly revisited if throughput approaches pgmq's practical ceiling — sustained writes in the high hundreds/sec per queue, or queue depth not draining between polling intervals.

### Implementation
_(Actual pgmq setup: queue names, polling interval, visibility timeout values chosen, any config tuning.)_

### Follow-up / Learnings
_(Did the Phase 1 numbers confirm pgmq was sufficient? Any early signs of the ceiling being approached?)_

---

## Phase 3 — Idempotency mechanism

**Status:** 🔲 Not started
**Depends on:** Phase 2 (queue/worker structure needs to exist first)

### Plan

| Approach | Pros | Cons |
|---|---|---|
| **Dedup table with unique constraint** (`notification_log(sighting_id, subscriber_id) UNIQUE`) | Strong DB-enforced guarantee, doubles as audit trail | Extra table + write; ordering matters (write dedup row in/before the external call) |
| **Atomic claim** (`UPDATE ... WHERE status = 'pending' RETURNING`) | No extra table, cheap, prevents concurrent double-pickup | Coarse-grained — doesn't cover per-subscriber fan-out on its own |
| **Provider idempotency key** | Pushes de-dup to a well-tested provider mechanism | Not universally supported across providers |
| **pgmq `msg_id` alone** | No extra schema | Insufficient alone — redelivery gets a new read of the same message |

**Recommendation:** atomic claim (prevents concurrent pickup) + per-side-effect dedup table (`notification_log`, `match_log`, `poster_log`) with unique constraints (guards against redelivery after a crash mid-processing). Fully Postgres-native, consistent with the rest of the design.

### Implementation
_(Actual table schemas, where the claim/dedup writes happen relative to the external API calls, any race conditions found during testing.)_

### Follow-up / Learnings
_(Did the dedup approach hold up under real redelivery scenarios? Any duplicate side effects observed despite the guard?)_

---

## Phase 4 — Shadow-mode validation

**Status:** 🔲 Not started
**Depends on:** Phase 1 (`events_log` as the comparison baseline), Phase 2 (workers to shadow-run), Phase 3 (idempotency in place before any real side effects)

### Plan
Run the new pgmq-based workers in parallel with the existing trigger cascade, but have them log actions to a `shadow_events` table instead of performing them (real push sends, real image-gen calls, etc. are skipped/mocked). A comparison job diffs `events_log` vs. `shadow_events` per `sighting_id`.

**Pros:** zero production risk, real correctness signal before any user sees the new path, catches `ST_DWithin` radius bugs / embedding pipeline bugs / enqueue trigger bugs cheaply.
**Cons:** doesn't validate real-world side effects (push delivery success, real API latency under load); needs comparison tooling; must tolerate legitimate non-determinism in embeddings/image-gen rather than requiring exact equality.

### Implementation
_(Comparison job details, what fields are compared, how non-determinism is handled, mismatch rate observed.)_

### Follow-up / Learnings
_(What mismatches were found and root-caused? What's the residual mismatch rate once known issues are fixed? Confidence level going into Phase 5.)_

---

## Phase 5 — Rollout strategy

**Status:** 🔲 Not started
**Depends on:** Phase 4 (shadow validation should reach an acceptable confidence level first)

### Plan

| Approach | Pros | Cons |
|---|---|---|
| Big-bang cutover | Simplest, fastest | All risk in one moment, hard rollback, no real-world validation first |
| Shadow/dual-write (Phase 4) | Safest validation, zero user risk | Slower, doesn't validate real delivery/latency |
| Feature-flag % rollout (canary) | Gradual, real production feedback, per-% rollback | Both paths run concurrently — needs Phase 3 idempotency in place |
| Strangler-fig, one queue at a time | Smallest blast radius per change | Prolongs timeline, both systems coexist longer |

**Recommended sequence:** shadow validation (Phase 4) → strangler-fig by risk: **poster worker first** (lowest user-facing urgency), then **matching worker**, then **notifications last** via percentage canary (most latency- and visibility-sensitive, so most gradual exposure + tightest rollback plan).

### Implementation
_(Actual cutover order and dates, canary percentages used, feature flag config, rollback events if any.)_

### Follow-up / Learnings
_(Issues hit during each cutover step, how quickly canary percentage was ramped, any rollbacks and why.)_

---

## Phase 6 — Cost as a design input

**Status:** 🔲 Not started
**Depends on:** Phase 1 (baseline volume for cost projection)

### Plan
Treat cost as a constraint alongside latency/throughput, not an afterthought.
- Identify cost drivers: embedding API calls, image-gen API calls, pgmq storage/IO (negligible — plain Postgres table).
- Project monthly cost: `(sightings/day) × (embedding cost + poster cost + notification send cost) × 30`, using Phase 1 baseline volume.
- Acknowledge the cost/latency/reliability triangle: batching reduces cost but adds latency; unbounded retries reduce failure rate but multiply cost on flaky APIs — cap retries with exponential backoff into the DLQ rather than retrying indefinitely.
- Flag the likely dominant cost driver (image generation) up front and propose a concrete bound — e.g., a per-user/per-day poster cap — so a cost spike has a hard ceiling.

### Implementation
_(Actual measured per-call costs, projected vs. actual monthly spend, caps/throttles implemented.)_

### Follow-up / Learnings
_(Did actual cost match the projection? Was the poster cap needed / triggered? Any cost surprises post-launch.)_

---

## Open questions / parking lot

_(Anything that comes up mid-implementation that doesn't cleanly belong to one phase — track here so it doesn't get lost.)_

-
