---
title: Introduction
description: What Errium does, and the problem it solves.
group: Getting Started
order: 1
---

Errium is a lightweight error normalization and translation library for Python
APIs. It intercepts uncaught exceptions, HTTP exceptions, and request
validation errors, and standardizes them into a single consistent,
frontend-safe JSON response shape.

It supports four frameworks today — FastAPI, Flask, Django Ninja, and Django
REST Framework — through a framework-agnostic core (`errium_core`) plus one
thin adapter package per framework, and a small set of
[Django helpers](/docs/django) for errors raised outside the view layer.

## The problem

Modern API frameworks yield inconsistent error responses, and the cost lands on
whoever consumes them.

- **Validation errors are hard to read.** Pydantic's output is deeply nested and
  verbose. A single missing field arrives as a list of objects with `loc`,
  `type`, `msg` and `input` keys that the client has to walk before it can show
  anything useful.
- **Backend responses disagree with each other.** An uncaught internal exception
  might leak a stack trace or return plain text, depending on where in the
  request lifecycle it was raised.
- **Every service needs its own parser.** Frontend engineers write bespoke
  error-handling for each microservice, because no two of them shape errors the
  same way.

## The solution

Errium runs every error through one pipeline, in four stages.

1. **Intelligent middleware.** `errium.install(app)` — or the equivalent entry
   point for your framework — transparently intercepts the request lifecycle.
2. **Classification.** `ClassificationEngine` resolves the error's category,
   status code, and user-facing message by running it past an ordered list of
   classifiers.
3. **Beautification and normalization.** Nested, complex validation errors
   collapse into a flat `{field: message}` map.
4. **Environment-aware sanitization.** Full tracebacks in development, sealed
   internals in production — switched by a single environment variable.

Every handled exception is also logged with its `trace_id`, so the ID a client
reports leads straight to the traceback.

The result is that every error your API returns looks the same, no matter what
threw it:

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

Ready to wire it up? Start with the [Quickstart](/docs/quickstart).
