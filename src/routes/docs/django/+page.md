---
title: Django helpers
description: JSON errors for the cases Ninja and DRF never see.
group: Frameworks
order: 5
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

```bash
pip install "errium[django]"
```

The `ninja` and `drf` extras include Django, so you do not need this one if you
already installed either.

## The gap

[Django Ninja](/docs/django-ninja) and [DRF](/docs/drf) only see exceptions
raised *inside their views*. Django itself renders everything else as HTML:

- an unknown URL, or a URL that fails a converter (`/item/abc/` for `<int:pk>`);
- Ninja's own `405 Method not allowed`;
- an exception raised by a Django middleware;
- an exception from a plain Django view.

An API client expecting JSON gets an HTML page instead. The `errium_django`
package closes that gap.

## Setup

```python:urls.py
# Root URLconf
handler400 = "errium_django.handler400"
handler403 = "errium_django.handler403"
handler404 = "errium_django.handler404"
handler500 = "errium_django.handler500"
```

```python:settings.py
MIDDLEWARE = [
    "errium_django.ErriumDjangoMiddleware",  # first, so it wraps everything below
    # ...
]

# Optional; this is the default.
ERRIUM_JSON_PATH_PREFIXES = ["/api/"]
```

## Who gets JSON

The helpers are conservative: a request gets the JSON envelope only if it asks
for one, so a browser visiting a missing page still sees Django's page.

A request gets JSON when:

- its `Accept` header ranks a JSON type above HTML
  (`application/json`, or anything ending in `+json`), or
- its path starts with one of `ERRIUM_JSON_PATH_PREFIXES`.

Wildcards are ignored: `*/*` — what `curl` and browsers send — does not count
as asking for JSON. Everyone else is passed straight to Django's own
`page_not_found`, `server_error`, `bad_request` and `permission_denied` views.

## What the middleware does

`ErriumDjangoMiddleware` assigns the request's trace id up front
(`request.errium_trace_id`) and, for requests that want JSON:

- turns an exception raised by a plain Django view into the envelope;
- turns an exception raised by a *later* middleware into the envelope.
  Django converts those into a bare 500 page before an outer middleware sees
  them, so Errium records the exception from Django's `got_request_exception`
  signal and swaps the page;
- turns a bare `HttpResponseNotAllowed` (Ninja's method check) into a
  `405 METHOD_NOT_ALLOWED` envelope, keeping the `Allow` header.

<Callout variant="warning">

Place it **first** in `MIDDLEWARE`. An exception in a middleware listed
*before* it can only be caught by `handler500`. And while `DEBUG = True`,
Django shows its technical 500 page instead of calling `handler500`.

</Callout>

## Messages that do not leak

Django's `Resolver404` message lists every URL pattern it tried. That is useful
on a debug page and wrong for an API, so an unmatched URL always returns the
fixed message "Resource not found."

## Classifiers

The helpers use their own engine: `DjangoExceptionClassifier` plus a
`Resolver404Classifier`. Add yours with `ERRIUM = {"CLASSIFIERS": [...]}` in
settings, as for DRF — see [custom classifiers](/docs/custom-classifiers).
