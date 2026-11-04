# @buape/docket

Generated TypeScript types and a dependency-free fetch client for the [Docket public API](https://docket.buape.com/api/docs). Works in browsers, Node, Bun, and Workers. No React, editor, or schema-validation dependencies.

## Install

```sh
bun add @buape/docket
```

## Read content

```ts
import { createDocketClient } from "@buape/docket/client"

const docket = createDocketClient({ baseUrl: "https://docket.buape.com" })
const { data, error, response } = await docket.GET(
	"/api/content/{slug}/{entrySlug}",
	{ path: { slug: "blog", entrySlug: "insanity" } }
)

if (!response.ok || !data) {
	throw new Error(error?.message ?? `Docket returned ${response.status}`)
}

console.log(data.title, data.body, data.author?.name)
```

`data` is the unwrapped API data on success; `error` is the unwrapped error on failure. Binary media endpoints return a `Response` in `data`. Network failures reject the request. `response` always contains the HTTP response when a request completes.

Private categories use a category-scoped bearer token. Keep private-category tokens on your server:

```ts
const privateDocket = createDocketClient({
	baseUrl: "https://docket.buape.com",
	headers: { Authorization: `Bearer ${process.env.DOCKET_TOKEN}` }
})
```

## Types only

```ts
import type { components, paths } from "@buape/docket"

type PublishedEntry = components["schemas"]["PublishedEntry"]
type BlogResponse =
	paths["/api/content/{slug}"]["get"]["responses"][200]["content"]["application/json"]
```

The root export is types-only. Runtime code lives at `@buape/docket/client`.

## Releases

This public repository mirrors the SDK package from Docket's private source repository; CMS source, credentials, and content are not included. SDK changes and changesets are authored in the source repository, not directly in this mirror.

- `main` publishes stable versions to npm's `latest` tag after Changesets version PRs are merged.
- `beta` publishes snapshots as `0.0.0-beta-YYYYMMDDHHMMSS` to the `beta` tag.
- GitHub Actions publishes through npm OIDC with provenance from `buape/docket-sdk`.
- The initial stable release is `0.1.0`, matching Docket and its API specification.

Use `bun add @buape/docket@beta` to opt into snapshots. Local package verification: `bun install && bun run typecheck`.
