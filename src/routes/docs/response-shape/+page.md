---
title: The response contract
description: Every field Errium emits, and when each one appears.
group: Concepts
order: 1
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

Every error response Errium produces uses the same shape, regardless of
framework or of what threw.

```json
{
  "success": false,
  "status_code": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "trace_id": "87b003a8-7c15-4a6c-9c76-a05b22b109e2",
  "timestamp": "2026-05-27T12:00:00Z",
  "details": {
    "password": "Password is required."
  }
}
```

## Fields

| Field | Type | Notes |
|---|---|---|
| `success` | boolean | Always `false` on an error response |
| `status_code` | integer | HTTP status |
| `code` | string | One of the seventeen [`ErrorCategory`](/docs/categories) values |
| `message` | string | User-facing summary |
| `trace_id` | string | Fresh `uuid4` per request (or your trusted `X-Request-ID`), also sent as the `X-Trace-Id` header — see [Trace IDs](/docs/trace-ids) |
| `timestamp` | string | ISO 8601 |
| `details` | object | Flat `{field: message}` map; present on validation errors. Bounded — see below |
| `debug` | object | Only when `ERRIUM_DEBUG` is on — see [Debug vs. production](/docs/debug-mode) |

`DefaultFormatter` is the only formatter, and it emits the first seven fields
on every response. `details` is `null` unless the error carried field-level
information.

## Bounded `details`

`details` is capped so a request with hundreds of invalid items cannot produce
a huge response: at most **50 entries**, keys of at most 200 characters, and
messages of at most 500. When entries were dropped, a `_truncated` key says how
many; it is absent otherwise.

```json
{
  "details": {
    "items.0.name": "Name is required.",
    "items.49.name": "Name is required.",
    "_truncated": "150 more"
  }
}
```

A key named `_` holds errors that are not tied to one field — DRF's
`non_field_errors` and Django's `__all__` both appear as `_` (nested:
`address._`). Several messages for one field are joined with `"; "`.

In production, a 5xx response always has `details: null`.

## Response headers

Every error response carries `X-Trace-Id`. Protocol headers already attached to
the exception — `Allow`, `Retry-After`, `WWW-Authenticate`, `Location` and
`Content-Range` — are kept, so a 429 still says when to retry and a 405 still
lists the allowed methods.

## The debug block

When `ERRIUM_DEBUG` is enabled, a `debug` object is appended:

```json
{
  "debug": {
    "exception": "KeyError",
    "message": "'user_id'",
    "stack_trace": "Traceback (most recent call last): ...",
    "hints": [
      "An internal database or backend logic error occurred. Check backend logs."
    ]
  }
}
```

`hints` is a list of strings, keyed off the status code. It is a static lookup
today — extending it is on the [roadmap](/roadmap). `message` is capped at 2,000
characters and `stack_trace` at 20,000 (the end of the trace is kept).

<Callout variant="warning">

The `debug` block carries full stack traces. It must never be enabled in
production. See [Debug vs. production](/docs/debug-mode) for the sanitization
rules that apply when it is off.

</Callout>

## One deliberate inconsistency

A validation error returns **422** on FastAPI, Flask and Django Ninja, but
**400** on DRF, because the DRF adapter preserves DRF's own established
convention rather than forcing uniformity on existing clients.

The shape above is identical across all four adapters either way — only that
one status code differs.
