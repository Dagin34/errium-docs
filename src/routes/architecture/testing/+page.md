---
title: Testing layout
description: How the suite is organised, and why conftest configures Django.
group: Architecture
order: 4
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

The suite splits along one line: does this test need a running app?

## `tests/unit/`

Pure unit tests against classifiers, normalizers, and the formatter. No app, no
client, no framework wiring. A classifier is just an object with a `classify`
method, so testing it means constructing an exception and asserting on the
`ClassifiedError` that comes back.

This is where edge cases belong — the duplicate-marker matching in
`DatabaseExceptionClassifier`, the template lookup order in
`ValidationNormalizer`, the 5xx sanitization rule in `DefaultFormatter`.

## `tests/integration/`

Each of these drives a real app end-to-end through the adapter's actual wiring,
and asserts on the full JSON response shape:

| Adapter | Client |
|---|---|
| FastAPI | `fastapi.testclient.TestClient` |
| Flask | `flask.Flask.test_client()` |
| Django Ninja | `ninja.testing.TestClient` |
| DRF | `rest_framework.test.APIRequestFactory` against `@api_view` views |

Going through the real integration point is the whole value here. A unit test
can confirm `FastAPIValidationErrorClassifier` returns a 422; only an
integration test confirms that `RequestValidationError` actually reaches it,
which — given that it bypasses middleware entirely — is the part most likely to
break.

<Callout variant="tip">

These tests are the best available proof of what the library actually does. If
you are unsure whether a given exception is caught on a given framework, the
integration suite answers it more reliably than any prose.

</Callout>

## `tests/conftest.py`

Configures a minimal Django settings module — including
`REST_FRAMEWORK["EXCEPTION_HANDLER"]` — and calls `django.setup()` before
collection.

This is not optional setup. Importing `errium_ninja` or `errium_drf` pulls in
`django.http` and `rest_framework`, and both raise
`ImproperlyConfigured` if Django settings have not been configured. Without
`conftest`, collection fails at import time, before a single test runs.

It is a no-op for the FastAPI and Flask suites, which have no Django dependency.

## Running

```bash
uv run pytest
uv run pytest --tb=short
```

CI runs `ruff check`, `ruff format --check`, `mypy`, and `pytest` across Python
3.11 and 3.12 on every push and pull request to `main`. The source is checked
under `mypy --strict`.
