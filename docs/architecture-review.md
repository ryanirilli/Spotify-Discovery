# Disco Stu — Architecture & Tech Stack

A snapshot of the project as it stands today. Written to be the first thing
you re-read after stepping away for a while.

---

## 1. What this app is

**Disco Stu** ("Crate digging for the streaming age") is a Spotify music
discovery web app. The tagline tells you the whole product strategy:
deliberately *not* the algorithmic radio you already get from Spotify. Users
seed a search with artists + genres + tempo, get a fresh wall of preview-able
tracks, and either:

1. Add tracks to a Spotify playlist (read/write via Spotify Web API), or
2. Publish their seed configuration as a **Collection** — a public, named,
   AI-cover-art'd recipe other visitors can browse on the homepage.

Production is at [https://discostu.app](https://discostu.app).

---

## 2. Tech stack at a glance

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 24.x | Pinned in [package.json:5](package.json) |
| Framework | Next.js 16 (App Router + legacy `pages/api`) | Webpack bundler explicitly: `next dev --webpack` |
| Language | TypeScript 5, `strict: true` | Path alias `@/*` → repo root |
| UI | Chakra UI v3 (`@chakra-ui/react ^3.34`) | Custom theme via `createSystem(defaultConfig, ...)` |
| Styling | Chakra tokens + `app/globals.css` | Tailwind is not used |
| Animation | `framer-motion` 12, Lottie | Lottie used for the playing-track sound bars |
| State | React Query v5 + React Context | No Redux/Zustand. Mutations are plain `useMutation`. |
| Drag/drop | `react-dnd` + HTML5 backend | Track cards are draggable onto playlists in the sidebar |
| Forms | Native `<form>` + Chakra inputs | No react-hook-form / Zod |
| Spotify SDK | `spotify-web-api-node` | Single shared singleton in [lib/SpotifyClient.ts](lib/SpotifyClient.ts) |
| Database | Neon Postgres (serverless HTTP driver) | `@neondatabase/serverless` |
| ORM | Drizzle (`drizzle-orm` + `drizzle-kit`) | Single table so far |
| File storage | Vercel Blob (`@vercel/blob`) | AI-generated cover PNGs |
| AI | OpenAI SDK v6 | `gpt-image-2` for covers, `gpt-4o-mini` for title moderation |
| Hosting | Vercel | `waitUntil` from `@vercel/functions` for background work |
| Lint | `eslint-config-next` v16 | No Prettier config; uses ESLint defaults |

What is **not** here, on purpose: testing framework, Storybook, Tailwind,
state library, design tokens package, custom CI. Everything is run through
Vercel's GitHub integration.

---

## 3. Repository layout

```
app/                     # Next.js App Router (RSC + client islands)
  layout.tsx             # Root <html>; loads Providers + globals.css
  page.tsx               # Public marketing/landing page (Spotify login CTA)
  providers.tsx          # QueryClientProvider + Chakra + Toaster (client)
  globals.css            # Body + global resets
  privacy-policy/        # Static page
  (app)/                 # Auth-gated route group
    layout.tsx           # Cookie check → redirect("/"); wraps providers + chrome
    home/page.tsx        # Renders <SpotifyDefaultContent /> (community feed)
    search/page.tsx      # Recommendation results + URL sync
    track/[id]/page.tsx  # Track detail / artist exploration

pages/api/               # Legacy Pages Router for ALL backend endpoints
  spotify-*.ts           # Auth, search, recs, playlist mutations
  collections/           # Collection CRUD (POST + GET /, GET + DELETE /[id])

components/              # All React components (one file per component)
  ui/                    # Generic primitives (Button, BottomSheet)
  Spotify*.tsx           # Feature components, mostly client-side

lib/
  SpotifyClient.ts       # Shared SpotifyWebApi singleton
  setSpotifyAccessToken.ts  # Higher-order handler for /api routes
  collections/           # Cover generation, title moderation, DB serializer

db/
  index.ts               # getDb() — lazy Drizzle/Neon client
  schema.ts              # Drizzle schema (single `collections` table)

drizzle/                 # Generated SQL migrations + meta journal
queries/                 # Client-side fetch wrappers (used by useQuery)
mutations/               # Client-side fetch wrappers (used by useMutation)
types/                   # Domain types (TSpotifyTrack, TSpotifyCollection, ...)
utils/                   # Hooks + small helpers (useElementHeight, scrollBarStyle, ...)
theme/                   # ChakraProvider.tsx — the entire design system
public/                  # Static SVG, lottie JSON, hero art
docs/                    # This file lives here
```

---

## 4. Routing model — and why both `app/` and `pages/`

This is the single biggest "huh?" you'll have on return:

- **All UI lives under `app/`** (App Router, RSC-aware).
- **All API endpoints live under `pages/api/`** (legacy Pages Router).

This is intentional and fine. The reasons it stays this way:

1. The Spotify endpoints are old and use the `NextApiRequest`/`Response`
   ergonomics + `req.cookies` shape that `setSpotifyAccessToken` was built
   around. Migrating would touch every route.
2. The `(app)` route group exists *only* to share the auth check + provider
   tree across `home`, `search`, `track/[id]`. It does the
   `cookies()` + `redirect("/")` server-side once in
   [app/(app)/layout.tsx](app/(app)/layout.tsx).
3. `app/page.tsx` is the unauthenticated landing/login screen — no provider
   tree, just a CTA to `/api/spotify-login`.

If you're adding a new authenticated page, drop it under `app/(app)/`. If
you're adding an API endpoint, keep it under `pages/api/` until/unless you
do a wholesale conversion.

---

## 5. Authentication flow (Spotify OAuth)

Cookie-based, no separate user table, no NextAuth. The flow:

1. User clicks "Login with Spotify" on `/` → hits
   [pages/api/spotify-login.ts](pages/api/spotify-login.ts)
2. Login route generates a `nanoid` state, sets `spotify_login_state`
   httpOnly cookie, redirects to `accounts.spotify.com/authorize` with the
   scopes:
   `user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public`
3. Spotify redirects back to `/api/spotify-auth-callback` with `code` +
   `state`. Callback validates state, exchanges code for tokens, sets two
   cookies:
   - `spotify_access_token` (httpOnly, `maxAge = expires_in`)
   - `spotify_refresh_token` (httpOnly, no expiry — sticks around)
   Then redirects to `/home`.
4. Every subsequent API route wraps its handler in
   [`setSpotifyAccessToken`](lib/setSpotifyAccessToken.ts), which:
   - Reads cookies from the request
   - Sets the access token on the *shared singleton* `spotifyApi`
   - On expired token, hits `accounts.spotify.com/api/token` with the
     refresh token, sets a new access cookie, re-runs the handler
5. The `(app)` layout double-checks the cookies server-side and redirects
   to `/` if neither is present — that's the only auth gate on the UI
   side. Individual API routes return 401 if they can't refresh.

**Important gotcha**: `spotifyApi` is a *module-level singleton*. Because
serverless functions on Vercel can be reused across invocations, the
access token set by request A is potentially visible to request B if they
hit the same warm instance. Today that's fine because every request sets
the token from its own cookies before calling the SDK — but if you ever
introduce a request that *doesn't* call `setSpotifyAccessToken` first,
you have a token-leak bug.

There is no logout button per se — `/api/spotify-clear-session` exists
and clears both cookies; it's wired up via the user-info menu in the
sidebar.

---

## 6. Data flow & client state

There's no global store. State is split three ways:

### 6a. React Query as the data cache

`QueryClient` is created in [app/providers.tsx](app/providers.tsx) with
`defaultOptions: { queries: { staleTime: Infinity } }` — i.e. nothing is
ever automatically refetched in the background. Refetches happen
explicitly (e.g. recommendations refetch when you press search), or via
`refetchInterval` for polling (e.g. the cover-status poll on a freshly
created collection).

Pattern: every backend request has a thin wrapper file under
`queries/` (for reads) or `mutations/` (for writes). UI components call
`useQuery` / `useMutation` with that wrapper as the `queryFn`/`mutationFn`.

### 6b. Context providers for transient UI state

The `(app)` layout stacks providers in this order (outermost first):

```
<SpotifyRecommendationsProvider>
  <SpotifyPlaylistsProvider>
    <SpotifyCurrentTrackProvider>
      <SpotifyAutocompleteProvider>
        <DesktopAppLayout ...>{children}</DesktopAppLayout>
```

What each one owns:

- **SpotifyRecommendationsProvider** — the heart of the app. Owns the
  `artists[]`, `genres[]`, `filters` state and the resulting recommendations
  query. Older artist seeds are auto-disabled when the 5-seed budget is
  full. See [components/SpotifyRecommendationsProvider.tsx](components/SpotifyRecommendationsProvider.tsx).
- **SpotifyPlaylistsProvider** — fetches the user's playlists once, dedupes
  by ID (Spotify can return the same playlist twice), memoizes the value
  so the per-track playlist menu doesn't re-render the world.
- **SpotifyCurrentTrackProvider** — just a `string | null` for which track
  is currently hovered/playing the audio preview.
- **SpotifyAutocompleteProvider** — the `isNew` flag that drives the
  empty-state "click search to begin" overlay.

### 6c. URL is the source of truth on `/search`

[components/SpotifySearchSync.tsx](components/SpotifySearchSync.tsx) is a
mount-only component that:

- On first mount, hydrates provider state from URL params if any are present,
  otherwise mirrors provider state into the URL.
- On subsequent provider changes, mirrors them back into the URL via
  `router.replace()`.
- If all seeds are cleared, redirects to `/home`.

The serializer/parser pair lives in
[utils/spotifySearchConfig.ts](utils/spotifySearchConfig.ts) and is shared
with the Collections feature so a published Collection's URL is the same
URL the search page uses.

---

## 7. The recommendations engine

The core read endpoint is
[pages/api/spotify-get-recommendations.ts](pages/api/spotify-get-recommendations.ts).
It takes `?artists=...&genres=...&max_tempo&target_tempo` and forwards to
`spotifyApi.getRecommendations({ limit: 100, ... })`, then **filters out
any track without a `preview_url`** so the autoplay-on-hover UX always
works.

Spotify's recommendations endpoint allows up to 5 total seeds across
artists + genres. The provider enforces this by only sending the *most
recently added* artists within the remaining budget after genres; older
artists stay in the `artists[]` array as visually-disabled pills the user
can re-enable by removing a newer one.

Tempo filters are surfaced via
[components/SpotifyTempoFilter.tsx](components/SpotifyTempoFilter.tsx) and
edited from
[components/SpotifyRecommendationFilters.tsx](components/SpotifyRecommendationFilters.tsx).

---

## 8. The Collections feature

This is the non-Spotify side of the product — the only thing that requires
your own infrastructure. A Collection is a published, named search
configuration with an AI-generated cover image.

### Schema

Single Drizzle table: see [db/schema.ts](db/schema.ts). Highlights:

- `id` is a `text` primary key, populated with `crypto.randomUUID()` server-side.
- `config` is a `jsonb` blob typed as `TSpotifySearchConfig`.
- `artistSnapshot` is a `jsonb` array of `{ id, name, imageUrl }` — denormalised
  at insert time so the homepage card can render artist faces without a
  Spotify roundtrip.
- `coverStatus` is a Postgres enum: `pending | ready | failed`.
- `coverImageUrl` and `coverBlobPath` are populated once cover generation finishes.

Migrations are in `drizzle/` and managed by `drizzle-kit`:

```bash
npm run db:generate  # diff schema.ts against snapshot, emit SQL
npm run db:migrate   # apply pending migrations
```

### Create flow

[pages/api/collections/index.ts](pages/api/collections/index.ts):

1. Normalise + truncate title (max 80 chars).
2. Validate at least one artist or genre seed.
3. **In parallel**: fetch the current Spotify user, build the artist
   snapshot, and call OpenAI for title moderation
   ([lib/collections/moderateTitle.ts](lib/collections/moderateTitle.ts)).
   Moderation fails *open* — a Postgres or OpenAI outage cannot block the
   user.
4. Insert the row with `coverStatus = "pending"`.
5. **Background work** via `waitUntil(generateCollectionCover(...))` —
   Vercel keeps the function alive past the 201 response so the OpenAI
   image roundtrip can complete. `maxDuration: 300` is set on the route.
6. Return the freshly inserted row to the client.

### Cover generation

[lib/collections/generateCollectionCover.ts](lib/collections/generateCollectionCover.ts)
calls `openai.images.generate` with `model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2"`,
1024×1024, low-quality, base64 response. The bytes are uploaded to Vercel
Blob at `collections/${id}/cover.png` and the row is updated to
`coverStatus = "ready"`. Failure marks `failed`.

### Polling on the client

[components/SpotifyShareCollectionButton.tsx](components/SpotifyShareCollectionButton.tsx)
opens the share dialog, fires the create mutation, then uses
`useQuery({ refetchInterval: 1500 })` against `GET /api/collections/[id]`
until `cover_status !== "pending"`. The homepage feed
([components/SpotifyDefaultContent.tsx](components/SpotifyDefaultContent.tsx))
does a longer 4s poll while *any* collection is still pending.

### Delete

`DELETE /api/collections/[id]` checks ownership against the current
Spotify user ID, deletes the row, then *fire-and-forgets* a `del()` on
the blob path. Not awaited because the row delete is the user-visible
action.

---

## 9. Database details

- Hosted on **Neon** (serverless Postgres). The HTTP driver is used —
  there is no connection pooling on the app side because Neon's HTTP
  endpoint handles per-request connections.
- Connection string lives in `DATABASE_URL` (Vercel env var).
- A pooled and unpooled URL are both provisioned by Vercel/Neon's
  integration. The HTTP driver doesn't care; it uses the pooled URL.
- `getDb()` in [db/index.ts](db/index.ts) is a lazy singleton — it only
  errors if `DATABASE_URL` is missing *and* something tries to use it.
  This means the rest of the app (auth, search, recs) keeps working even
  if the DB is misconfigured locally.
- Only one table today. If you add more, you'll need to extend the
  schema file and run `db:generate` + commit the new migration.

---

## 10. External services / required env vars

| Variable | Purpose |
| --- | --- |
| `NEXT_SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `NEXT_SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `NEXT_SPOTIFY_REDIRECT_URI` | Must match Spotify dashboard exactly |
| `DATABASE_URL` | Neon Postgres pooled connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, write access |
| `OPENAI_API_KEY` | OpenAI account key |
| `OPENAI_IMAGE_MODEL` | (optional) defaults to `gpt-image-2` |
| `OPENAI_MODERATION_MODEL` | (optional) defaults to `gpt-4o-mini` |

`.env.local` (gitignored) is the local dev source. `.env.production.local`
mirrors prod. Vercel UI is the production-of-record.

The `NEXT_` prefix on the Spotify vars is **not** the standard
`NEXT_PUBLIC_` — these are server-only, the prefix is just legacy naming.
Don't expose them to the client by accident.

---

## 11. UI system

### Chakra v3, not v2

This matters. v3 is API-incompatible with v2 — `extendTheme` is gone,
recipes replace component variants, slot recipes replace multipart
component themes. All the docs you find via Google for "Chakra UI" are
v2 unless you go to `chakra-ui.com/docs/components`.

[theme/ChakraProvider.tsx](theme/ChakraProvider.tsx) is the entire design
system in one file:

- **Tokens**: `electricPurple` (full 50-950 scale, brand accent for all
  CTAs/highlights) + `spotifyGreen` (reserved for Spotify-branded UI like
  the user avatar fallback — *not* used for CTAs).
- **Color palette wiring**: `globalCss` sets `--chakra-colors-color-palette-*`
  on `body` so descendants inherit `electricPurple` without a wrapper DOM
  element (avoids hydration mismatches).
- **`textStyles`**: a hand-curated set of named styles (`brandDisplay`,
  `displayTitle`, `pageTitle`, `sectionTitle`, `itemTitle`, `itemMeta`,
  `body`, `controlLabel`, `microLabel`, `dialogTitle`, `statusText`).
  Components use `<Text textStyle="..."/>`. Always prefer adding to this
  list over inline `fontSize`. See `docs/typography-assessment.md` for
  context on why this set exists.
- **Recipes**: only `button` and `input` are customised today.
- **Slot recipes**: `dialog` (darker blurred backdrop) and `switch`
  (purple-on-whiteAlpha).

### Custom Button wrapper

[components/ui/Button.tsx](components/ui/Button.tsx) wraps Chakra's
`<Button>` and `<IconButton>` and exposes a `visual` prop with three
values: `primary` (electric purple CTA), `secondary` (whiteAlpha pill),
`ghost` (transparent + hover bg). It collapses Chakra's many built-in
variants into the three the design actually uses. **Always use this
wrapper, not `@chakra-ui/react`'s `Button`** — that's how the recipe
above gets applied.

### BottomSheet

[components/ui/BottomSheet.tsx](components/ui/BottomSheet.tsx) is a
hand-rolled mobile sheet (Framer Motion + portal). It deliberately does
*not* use Chakra's Drawer. Worth re-reading the file's top comment if
you ever touch keyboard handling — it relies on
`interactive-widget=resizes-content` in the viewport meta to avoid JS
translate hacks for soft-keyboard avoidance.

### Layout chrome

[components/DesktopAppLayout.tsx](components/DesktopAppLayout.tsx) is the
two-column (sidebar + main) layout used inside `(app)`. Sidebar collapse
state is persisted to `localStorage` under `desktopSidebarCollapsed`.
Top nav height is measured and exposed via context so the sidebar can
size itself to fill the rest. Wraps the tree in `DndProvider` — drag/drop
of tracks into playlists is global to the app.

---

## 12. Hosting & runtime

- **Vercel**, GitHub-driven deploys, no custom CI.
- API routes run as Vercel serverless functions. `pages/api/collections/index.ts`
  uses `export const config = { maxDuration: 300 }` to allow the
  background `waitUntil` cover-gen to complete (OpenAI image gen +
  Vercel Blob upload can run for tens of seconds).
- `next.config.js` opts in to:
  - `experimental.viewTransition` — used in
    [components/SpotifyTracks.tsx](components/SpotifyTracks.tsx) for
    morph transitions on album art when navigating to track detail.
  - `experimental.optimizePackageImports: ['@chakra-ui/react']` — tree-shakes
    Chakra's barrel exports.
  - `images.remotePatterns` allowing `i.scdn.co` (Spotify CDN).
- Build is forced through Webpack (`--webpack`), not Turbopack — leaving a
  note here in case Turbopack is the default by the time you re-read this
  and you wonder why.

---

## 13. Things that will surprise you on return

A short list of decisions that aren't self-evident from the code:

1. **App Router for UI, Pages Router for APIs**. Don't unify it on a whim.
2. **`spotifyApi` is a module-level singleton**. Always go through
   `setSpotifyAccessToken` before calling it.
3. **Older artist seeds aren't deleted, just disabled**. The seed budget
   logic lives in `getEnabledArtistsForConfig` — it's used both client-side
   (provider) and server-side (collection create endpoint) so a published
   collection's `artist_snapshot` only contains the artists Spotify will
   actually use.
4. **Tracks without a `preview_url` are dropped server-side**. If Spotify
   ever returns a recommendation set that's mostly preview-less, the UI
   will look sparse for reasons that aren't visible from the client code.
5. **Title moderation fails open**. A flaky OpenAI call won't block users
   from publishing. If you need stricter behaviour, change the catch in
   [lib/collections/moderateTitle.ts](lib/collections/moderateTitle.ts).
6. **Cover generation runs *after* the response is sent** via
   `waitUntil`. The dialog polls; the user sees a spinner. If a user
   creates a collection on a free Vercel account or hits a runtime that
   doesn't honour `waitUntil`, the cover never lands and stays `pending`.
7. **React Query `staleTime: Infinity` everywhere by default**. If you
   add a new query and expect it to refetch on focus or interval, you
   need to opt in explicitly.
8. **No logout in the canonical sense** — `/api/spotify-clear-session`
   nukes the cookies, but the Spotify side still has the grant. You'd
   have to revoke from Spotify's dashboard for a clean disconnect.
9. **Chakra is v3**, not v2. Don't `npm install` v2 docs' suggestions.
10. **Use `@/components/ui/Button`, not `@chakra-ui/react`'s Button.**
    Same for `IconButton`.
11. **`react-icons` and `react-dnd` are old (v4 / v16) but pinned**.
    They work; upgrade carefully.
12. **There is no test suite**. Verification is manual against
    `npm run dev` on port 3000.

---

## 14. Common tasks playbook

### Local development

```bash
npm install
npm run dev    # next dev --webpack on http://localhost:3000
```

You need a populated `.env.local` with at minimum the Spotify vars to
log in. Without `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN` /
`OPENAI_API_KEY` everything except Collections still works.

### Add a database column

1. Edit [db/schema.ts](db/schema.ts).
2. `npm run db:generate` — creates a new file under `drizzle/`.
3. Inspect the SQL, commit it.
4. `npm run db:migrate` to apply locally.
5. On deploy, run `db:migrate` against prod (today this is manual via
   `vercel env pull` + a local run, or via a one-off Vercel function).

### Add a new Spotify API endpoint

1. Add a route under `pages/api/spotify-<name>.ts`.
2. Wrap the handler in `setSpotifyAccessToken(req, res, spotifyApi, async () => { ... })`.
3. Add a fetch wrapper under `queries/` or `mutations/`.
4. Consume from a component via `useQuery` / `useMutation`.

### Add a new authenticated page

1. New folder under `app/(app)/<name>/page.tsx`.
2. The auth check + provider tree comes for free from `(app)/layout.tsx`.
3. If you need a different chrome (e.g. no sidebar), refactor
   `DesktopAppLayout` to accept variants — don't fork it.

### Tweak the design system

Almost always a single edit in [theme/ChakraProvider.tsx](theme/ChakraProvider.tsx).
Add a new text style there before reaching for inline `fontSize`. Add a
new button variant by extending the `button` recipe rather than creating
a new component wrapper.

### Change a Spotify scope

Edit the `scope` string in
[pages/api/spotify-login.ts](pages/api/spotify-login.ts). Existing
sessions will keep their old scopes until the cookie expires or the user
logs in again.

---

## 15. Where the bodies are buried (TODOs to revisit)

These aren't critical but they're worth knowing:

- The single `spotifyApi` singleton is a footgun (see §5). Long-term it
  should be an instance-per-request created inside `setSpotifyAccessToken`.
- Collections have no rate-limiting or auth-scoping beyond ownership-on-
  delete. Anyone logged into Spotify can publish unlimited collections.
- The cover-blob delete on row delete isn't transactional — if the blob
  delete fails after the row is gone, you orphan the file forever.
- `db/index.ts` only knows about Neon. If you ever switch to a different
  Postgres host, replace `neon()`/`drizzle/neon-http` with the
  appropriate driver.
- ESLint config is `.eslintrc.json` — note the new flat-config world has
  `eslint.config.js`. ESLint 9 supports both, but a future bump may force
  a migration.
