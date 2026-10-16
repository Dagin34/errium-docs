---
title: Validation normalization
description: How nested Pydantic errors become a flat, readable map.
group: Concepts
order: 5
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

`ValidationNormalizer.normalize(errors)` takes a raw Pydantic or FastAPI
`errors()` list — dicts carrying `loc`, `type` and `msg` — and returns a flat
`{field_path: message}` dict.

```json
{
  "detail": [
    { "type": "missing", "loc": ["body", "password"], "msg": "Field required", "input": null }
  ]
}
```

becomes:

```json
{
  "password": "Password is required."
}
```

<Callout variant="note">

A body that is not parseable JSON is not a validation failure of a field, so it
is reported as **400 `BAD_REQUEST`** ("Malformed request body.", no `details`)
on every adapter. Well-formed JSON that breaks your schema is still 422
`VALIDATION_ERROR` (400 on DRF).

</Callout>

## The three steps

**1. Strip the location prefix.** If the first `loc` segment is one of `body`,
`query`, `header`, `path` or `formData`, it is dropped. The remaining segments
join with dots, so a nested field becomes `address.postcode`. An empty path
falls back to the key `field`.

**2. Look up a message template.** The normalizer tries, in order: the error's
`type`, then its `msg` lowercased, then `msg` as given. If none match, it scans
for a mapping key contained in either the message or the type. If nothing
matches at all, the original message is used unchanged.

The built-in mappings:

| Key | Template |
|---|---|
| `missing` | `{field_name} is required.` |
| `field required` | `{field_name} is required.` |
| `value_error.email` | `Invalid email format.` |
| `value is not a valid email` | `Invalid email format.` |
| `none is not an allowed value` | `Value cannot be empty.` |

**3. Format and tidy.** A `{field_name}` placeholder is filled with the last
path segment, underscores replaced by spaces and the first letter capitalised —
so `user_id` renders as "User id". The result gets a trailing full stop if it
lacks one, and its first character capitalised.

## Custom mappings

Pass your own templates at construction. They merge over the defaults, so you
can override a built-in or add a new type:

```python
from errium_core.normalizers.validation import ValidationNormalizer

normalizer = ValidationNormalizer(
    custom_mappings={
        "string_too_short": "{field_name} is too short.",
        "missing": "We need a {field_name} to continue.",
    }
)
```

## Which adapters use it

The FastAPI validation handler, the Flask extension, and the Ninja adapter all
run `ValidationNormalizer`. A Django `ValidationError` raised on Ninja or DRF is
flattened too: `{field: "message; message"}`, with `_` for non-field errors.

`details` is capped at 50 entries; see
[The response contract](/docs/response-shape).

<Callout variant="note">

The DRF adapter does **not**. DRF's `ValidationError.detail` is a recursive tree
of already human-readable `ErrorDetail` strings — a different shape from
Pydantic's `loc`/`type`/`msg` list, and one that needs no template lookup. So
`errium_drf.normalizers.flatten_drf_errors` does its own recursive flattening
instead, producing the same flat `{field: message}` result.

Nested DRF structures flatten with dotted keys and list items get an index
suffix like `items[0].name`. Several messages for one field are joined with
`"; "`, and errors with no field — DRF's `non_field_errors`, at any depth —
use the key `_` (`address._` when nested), so DRF's internal name does not
reach your clients.

</Callout>
