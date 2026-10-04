# Design

## Data Model

The backend stores synthetic events in SQLite. Each event contains:

- `id` — database-generated identifier
- `anonymous_id` — synthetic anonymous user identifier
- `event_type` — one of the supported event types
- `occurred_at` — ISO timestamp for the event

The audience request is not stored. It contains an audience name, an `asOf` timestamp, and one or more conditions. Each condition specifies an event type, an operator (`at_least` or `exactly`), a count, and a time window.

SQLite was chosen because the assignment only requires a small local dataset and SQLite keeps setup simple for reviewers.

## Rule Evaluation

Audience evaluation happens entirely in the backend. The frontend only collects the rule and displays the result; it does not calculate membership.

The evaluator gets the distinct anonymous users from the event data and evaluates every condition for each user. For each condition, it counts matching events within the requested time window and applies the selected operator:

- `at_least`: observed count must be greater than or equal to the requested count.
- `exactly`: observed count must equal the requested count.

All conditions must match, so conditions are combined with AND.

The evaluator also records the observed count for each condition as evidence. This lets the frontend explain why a user matched.

## Time Window

The API requires an `asOf` timestamp. The evaluator calculates each condition's start time from `asOf - withinDays` and only considers events between that start time and `asOf`, inclusive.

Using the supplied `asOf` instead of the server's current clock makes previews reproducible and avoids results changing depending on when the request happens.

## Validation and API Boundary

Zod validates incoming audience requests before evaluation. This ensures event types, operators, counts, time windows, and required fields have the expected types and values.

SQLite queries use prepared statements rather than constructing SQL from user input.

## Scaling / Product Trade-off

The evaluator currently calculates event counts from the raw event table when a preview is requested. This keeps the event data simple and means new event types or time windows do not require maintaining separate aggregates.

With a larger event volume, repeatedly counting raw events for every preview would become a bottleneck. Pre-aggregating counts by anonymous user and event type would make previews faster, but would also add complexity around maintaining those aggregates when new events arrive.

The current raw-event approach keeps the source of truth simple while still supporting the required audience rules and time windows.