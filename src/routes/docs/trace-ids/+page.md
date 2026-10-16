---
title: Trace IDs
description: Correlating a client-facing error with the server-side log line.
group: Concepts
order: 7
---

Every error response carries a `trace_id`: a `uuid4` generated for the request,
echoed in the `X-Trace-Id` response header.

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

## It is logged for you

Errium logs every exception it handles on the `errium` logger, with the
`trace_id` in the message:

| Status | Level | Traceback |
|---|---|---|
| 500 and above | `ERROR` | Yes |
| Below 500 | `WARNING` | No — one line |

```text
ERROR errium: GET /orders/7 -> 500 INTERNAL_SERVER_ERROR trace_id=87b003a8-7c15-4a6c-9c76-a05b22b109e2
Traceback (most recent call last): ...
```

The line includes the method, path, status, category and `trace_id`, and the
record carries `errium_trace_id`, `errium_status_code` and `errium_category` as
extra attributes for structured logging.

Errium never configures logging handlers — that is your application's
decision. Attach one to the `errium` logger (or let it propagate to the root
logger):

```python
import logging

logging.getLogger("errium").addHandler(logging.StreamHandler())
```

Searching your logs for the ID a user quoted now finds the traceback.

## Reading it in your own code

The ID is assigned once per request, before your view runs, and is available:

| Where | How |
|---|---|
| FastAPI | `request.state.errium_trace_id` |
| Flask | `flask.g.errium_trace_id` |
| Django Ninja / DRF | `request.errium_trace_id` |
| Anywhere in the request's context | `errium_core.tracing.current_trace_id()` |

`current_trace_id()` is a `ContextVar`, so it works in a logging filter that
stamps your own log lines with the same ID. On Django, `request.errium_trace_id`
is assigned by `ErriumDjangoMiddleware` up front; without it, it is assigned
when the first error is handled.

## Reusing a request ID

By default the ID is always a fresh `uuid4`. If a gateway or load balancer
already stamps requests with `X-Request-ID` and you want one ID across the whole
chain, opt in:

```bash
ERRIUM_TRUST_REQUEST_ID=true
```

Errium then reuses the inbound `X-Request-ID` as the `trace_id` — but only when
it is at most 128 characters of letters, digits and `. _ : -`. Anything else is
ignored and a fresh `uuid4` is used, so a client cannot inject arbitrary text
into your logs or responses. It is off by default because the header comes from
the client.
