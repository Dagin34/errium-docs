import { highlightToHtml } from '$lib/shiki';

/**
 * A server load so Shiki runs at build time only and never reaches the client
 * bundle. Every route is prerendered, so this executes once during the build.
 */

const WITHOUT = `{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "password"],
      "msg": "Field required",
      "input": null
    }
  ]
}`;

const WITH = `{
  "success": false,
  "status_code": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "trace_id": "87b003a8-7c15-4a6c-9c76-a05b22b109e2",
  "timestamp": "2026-05-27T12:00:00Z",
  "details": {
    "password": "Password is required."
  }
}`;

export async function load() {
	const [without, withErrium] = await Promise.all([
		highlightToHtml(WITHOUT, 'json'),
		highlightToHtml(WITH, 'json')
	]);

	return { without, withErrium };
}
