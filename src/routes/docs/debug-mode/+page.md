---
title: Debug vs. production
description: What ERRIUM_DEBUG changes, and what it must never be in production.
group: Concepts
order: 6
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

One environment variable decides how much Errium says about a failure.

```bash
ERRIUM_DEBUG=true
```

The value is read at import time and is truthy for `true`, `1` or `yes`, case
insensitive. Anything else — including unset — means debug is off.

<Callout variant="warning">

`ERRIUM_DEBUG` must never be enabled in production. With it on, every 5xx
response carries a full stack trace, the originating exception's class name,
and its message straight to the client.

</Callout>

## Production: sanitization

With debug off, `DefaultFormatter` applies one rule: any response whose
`status_code` is **500 or above** has its `code` and `message` replaced with a
generic pair, regardless of what the classifier produced.

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

So a `DATABASE_ERROR` — which carries a 500 — reaches the client as
`INTERNAL_SERVER_ERROR` in production. The classification still happened and is
still what your logs correlate against via the `trace_id`; it just isn't
disclosed.

Errors below 500 are not sanitized. A 404 keeps `RESOURCE_NOT_FOUND` and its
message, because nothing internal leaks through it.

## Development: the debug block

With debug on, sanitization is skipped and a `debug` object is appended:

```json
{
  "debug": {
    "exception": "IntegrityError",
    "message": "duplicate key value violates unique constraint \"users_email_key\"",
    "stack_trace": "Traceback (most recent call last): ...",
    "hints": [
      "An internal database or backend logic error occurred. Check backend logs."
    ]
  }
}
```

| Key | Contents |
|---|---|
| `exception` | The exception's class name |
| `message` | `str(exception)` |
| `stack_trace` | Full formatted traceback |
| `hints` | List of suggestions, keyed off the status code |

## Hints

`hints` is a static lookup on the status code:

| Status | Hint |
|---|---|
| 422 | Check the `details` field for specific validation failures. |
| 404 | Verify the resource ID or path exists in the database. |
| 401 / 403 | Check request authentication headers and scopes. |
| 500+ | An internal database or backend logic error occurred. Check backend logs. |

Making these context-aware rather than status-keyed is on the
[roadmap](/roadmap).

## Overriding at runtime

Settings are a process-global singleton. `get_settings()` reads it and
`set_settings()` replaces it — useful in tests, where you want to assert both
the sanitized and unsanitized shapes:

```python
from errium_core.config.settings import ErriumSettings, set_settings

set_settings(ErriumSettings(debug=True))
```
