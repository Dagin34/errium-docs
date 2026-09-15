---
title: Trace IDs
description: Correlating a client-facing error with the server-side log line.
group: Concepts
order: 7
---

Every error response carries a `trace_id`: a fresh `uuid4`, generated per
error.

```json
{
  "success": false,
  "status_code": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred.",
  "trace_id": "87b003a8-7c15-4a6c-9c76-a05b22b109e2",
  "timestamp": "2026-05-27T12:00:00Z",
  "details": null
}
```

## Why it matters

In production, a 5xx response is deliberately vague — `code` and `message` are
[sanitized](/docs/debug-mode) so nothing internal leaks to the client. That is
the right default, but it leaves a support problem: a user reports an error and
you have nothing to search for.

The `trace_id` closes that gap. It is the one piece of the internal picture
that is safe to expose, because it identifies the occurrence without describing
it. A user can quote it, a frontend can surface it in an error state, and you
can find the exact failure in your logs.

It is generated fresh per error rather than per request, so two failures are
never conflated.

## Using it

Surface it wherever an error reaches a person:

> Something went wrong. Quote reference `87b003a8` if you contact support.

And log it alongside the exception on the server, so the two ends actually
meet. Errium puts the ID in the response; making sure it also reaches your logs
is your application's job — Errium does not configure logging for you.
