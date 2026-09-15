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
| `code` | string | One of the seven [`ErrorCategory`](/docs/categories) values |
| `message` | string | User-facing summary |
| `trace_id` | string | Fresh `uuid4` per error, for [log correlation](/docs/trace-ids) |
| `timestamp` | string | ISO 8601 |
| `details` | object | Flat `{field: message}` map; present on validation errors |
| `debug` | object | Only when `ERRIUM_DEBUG` is on — see [Debug vs. production](/docs/debug-mode) |

`DefaultFormatter` is the only formatter, and it emits the first seven fields
on every response. `details` is `null` unless the error carried field-level
information.

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
today — extending it is on the [roadmap](/roadmap).

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
