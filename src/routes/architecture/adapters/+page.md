---
title: Adapter internals
description: How each adapter hooks its framework, and where they deliberately differ.
group: Architecture
order: 3
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

Every adapter does the same four things — build an engine, classify, wrap in
`StandardizedError`, format and return. What differs is where the framework
lets you intervene.

## FastAPI — `errium`

Two entry points, deliberately.

`ErriumMiddleware` is a Starlette `BaseHTTPMiddleware` wrapping `call_next` in
`try`/`except`. It registers `FastAPIHTTPExceptionClassifier` (200) and
`FastAPIValidationErrorClassifier` (210).

`validation_exception_handler` is registered separately against
`RequestValidationError`, because Starlette resolves that through FastAPI's
exception-handler mechanism rather than through middleware exception
propagation. It additionally runs `ValidationNormalizer`. See
[FastAPI](/docs/fastapi).

## Flask — `errium_flask`

A single `app.register_error_handler(Exception, ...)` covers both
`HTTPException`s from `flask.abort()` and uncaught exceptions, because Flask
dispatches both to an `Exception` handler when nothing more specific is
registered.

It runs `ValidationNormalizer` when the caught exception is a pydantic
`ValidationError`, since Flask has no request-validation exception type of its
own. Ships `WerkzeugHTTPExceptionClassifier`, and supports the app factory
pattern through `init_app()`.

## Django Ninja — `errium_ninja`

`register_errium(api)` registers one shared handler against four exception
types, overriding Ninja's built-in defaults for each. The override matters
because Ninja's own `Exception` handler re-raises when Django's `DEBUG` is off,
returning Django's HTML error page rather than JSON.

It also strips Ninja's synthetic parameter-name segment from validation error
locations, so `details` keys match the other adapters. See
[Django Ninja](/docs/django-ninja).

## DRF — `errium_drf`

`errium_exception_handler(exc, context)` is a plain function resolved from
`REST_FRAMEWORK["EXCEPTION_HANDLER"]`. It never returns `None`, which is what
gives it catch-everything coverage without middleware, and it mirrors DRF's
`WWW-Authenticate` / `Retry-After` header behaviour. See
[Django REST Framework](/docs/drf).

<Callout variant="note">

The DRF adapter builds its `ClassificationEngine` **once at module import**, as
a module-level `_engine`, rather than per call. The other three build theirs
per middleware instance, per extension instance, or per registration call. It
makes no difference to behaviour, but it matters if you are registering
[custom classifiers](/docs/custom-classifiers).

</Callout>

## A deliberate duplication

`DjangoHttp404Classifier` and `DjangoPermissionDeniedClassifier` exist in both
`errium_ninja` and `errium_drf` — duplicated, not shared.

That is intentional. Each adapter package depends only on `errium_core`, never
on another adapter. Factoring the Django classifiers into a shared
`errium_django` package would mean a DRF user installing Ninja's adapter, or a
fifth package existing solely to hold two small classes.

The cost is two copies of about twenty lines. The benefit is that the
dependency graph stays a star — core at the centre, adapters at the points,
no edges between them. For a library whose whole architecture is about not
importing frameworks you don't use, that trade is the consistent one.

## Adding a new adapter

Nothing in `errium_core` should need to change. Create
`src/errium_<framework>/` containing framework-specific classifiers plus one
integration point that builds a `ClassificationEngine`, classifies, formats,
and returns the framework's native response type.

If you find yourself needing to modify the core to support a framework, that is
a signal the core is missing an abstraction — raise it as an issue rather than
working around it.
