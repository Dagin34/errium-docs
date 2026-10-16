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

The value is read at import time. `true`, `1`, `yes` and `on` enable it, case
insensitive and ignoring surrounding whitespace (so `" True "` works). Anything
else — `y`, `enabled`, `debug`, `2`, empty, unset — leaves debug off: the
failure mode is always the safe one.

Errium logs the active mode once at import (`INFO` on the `errium` logger), and
logs a `WARNING` if debug is on while `ERRIUM_ENV`, `APP_ENV`, `ENVIRONMENT` or
`ENV` is set to `production`, `prod` or `live`.

<Callout variant="warning">

`ERRIUM_DEBUG` must never be enabled in production. With it on, every 5xx
response carries a full stack trace, the originating exception's class name,
and its message straight to the client.

</Callout>

## Production: sanitization

With debug off, `DefaultFormatter` applies one rule: any response whose
`status_code` is **500 or above** has its `message` replaced with a generic
one and its `details` dropped, regardless of what the classifier produced. For
most 5xx the `code` is replaced too.

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

Three gateway statuses keep a meaningful code, with a generic message for it,
because a client can reasonably act on "the upstream is down":

| Status | `code` | `message` |
|---|---|---|
| 502, 503 | `SERVICE_UNAVAILABLE` | The service is temporarily unavailable. |
| 504 | `TIMEOUT` | The request timed out. |

Every other 5xx — 500, 501, 505 — becomes `INTERNAL_SERVER_ERROR` /
"An unexpected error occurred." An exception's text never reaches the client in
production, including when you raise `HTTPException(500, "secret")` yourself.

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
| `message` | The exception's text, capped at 2,000 characters |
| `stack_trace` | Formatted traceback, capped at 20,000 characters (the end is kept) |
| `hints` | List of suggestions, keyed off the status code |

### Request input is never echoed

For validation errors the debug `message` and the last line of the
`stack_trace` list only each error's location, message and type. They do
**not** include the submitted `input` that Pydantic attaches, which in debug
mode would hand a password or a megabyte-sized body straight back to the
caller.

### It cannot raise

Rendering the debug block uses a text helper (`safe_str`) that tries `str()`,
then `repr()`, then the class name, so an exception whose `__str__` raises, or
whose arguments are unprintable, still produces a normal response with the real
class name in `debug.exception`. If classification or formatting itself fails,
Errium returns a generic `INTERNAL_SERVER_ERROR` envelope with a fresh
`trace_id` rather than letting your framework's own error page through.

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
