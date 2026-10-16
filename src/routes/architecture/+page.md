---
title: Core vs. adapters
description: The one design decision the whole library is built around.
group: Architecture
order: 1
---

Errium is six packages: a framework-agnostic core, one thin adapter per
supported framework, and a small set of Django helpers.

```text
src/
├── errium_core/     # framework-agnostic: classification, contracts, formatting, settings
├── errium/          # FastAPI / Starlette adapter
├── errium_flask/    # Flask adapter
├── errium_ninja/    # Django Ninja adapter
├── errium_drf/      # Django REST Framework adapter
└── errium_django/   # URLconf handlers + middleware for errors outside Ninja/DRF views
```

## The core imports no framework

`errium_core` never imports FastAPI, Starlette, Flask, Django or SQLAlchemy.
Not as an optional dependency, not behind a `try`/`except ImportError`. It
doesn't import them at all.

It still has to recognise their exception types, so it **duck-types** instead:

```python
# Is this a FastAPI request validation error?
is_fastapi_val = exc.__class__.__name__ == "RequestValidationError"

# Is this a database error? (SQLAlchemy, django.db, sqlite3, psycopg, ...)
return any(
    klass.__module__ == module or klass.__module__.startswith(module + ".")
    for klass in type(exc).__mro__
    for module in _DB_MODULES
)
```

Checking `exc.__class__.__name__`, or walking `type(exc).__mro__` for a known
module path, identifies the type without a dependency on the package that
defines it.

This is the decision everything else follows from:

- **The core stays dependency-light.** A Flask user doesn't inherit SQLAlchemy;
  a Django user doesn't inherit Starlette.
- **Database and Django classification work without those packages installed.**
  If SQLAlchemy or Django isn't there, no exception will ever have its module
  path, and the classifier simply never matches.
- **Adding a framework never requires touching the core.** A new adapter is
  purely additive.

The trade-off is honest: duck-typing is weaker than `isinstance`. A class
coincidentally named `RequestValidationError` would match. In practice that has
not been a problem, and the alternative — importing four web frameworks into a
library that might use one of them — is worse.

## What an adapter contributes

Each adapter package provides two things:

1. **Classifiers.** One or more `ExceptionClassifier` implementations for that
   framework's exception types, registered at priority 200 and above so they
   take precedence over the core's generic matching.
2. **An integration point.** A hook into the framework's own error-handling
   mechanism, which builds a `ClassificationEngine`, classifies the exception,
   wraps it in a `StandardizedError`, formats it with `DefaultFormatter`, and
   returns the framework's native JSON response type.

The integration point is the only part that differs meaningfully between
adapters, because it is the only part that has to speak the framework's
language — middleware for FastAPI, an error handler for Flask, a registration
call for Ninja, a settings hook for DRF.

Read on: [Core building blocks](/architecture/core) ·
[Adapter internals](/architecture/adapters)
