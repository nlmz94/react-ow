# OnlyWeebs — Next.js port of `nuxtOW`

**Date:** 2026-09-29
**Status:** Approved design, pending spec review

## Goal

Rebuild the `nuxtOW` front-end (Nuxt 4) as a Next.js app in `react-ow`, with feature and visual parity, using idiomatic React / Next.js App Router patterns rather than a line-by-line translation of the Vue code.

Success means: every route, state (loading / error / empty / 404) and interaction that exists in `nuxtOW` exists in `react-ow`, talks to the same `symfonyOW` API unchanged, looks the same in light and dark mode, and passes lint, tests and `next build`.

## Stack (decided)

| Concern      | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Next.js 16.3 App Router, React 19.2, TypeScript (already scaffolded)   |
| Styling      | Tailwind CSS 4 with the existing palette as theme tokens               |
| Icons        | `@fortawesome/react-fontawesome` + free solid / regular / brands packs |
| Theme        | `next-themes` (`attribute="data-theme"`, system default)               |
| Data         | Server Components for public data; `fetch`, no client data library     |
| Auth         | Client React context; session cookie stays on the API origin           |
| Tests        | Vitest + React Testing Library + jsdom                                 |

Next.js 16 has breaking changes compared with older versions. Before writing each piece, read the relevant guide in `node_modules/next/dist/docs/` (per `AGENTS.md`). Known differences: `params` / `searchParams` are Promises, `error.tsx` receives `retry()` (not `reset()`), and middleware is now `proxy.ts`.

## Out of scope

- Any API change in `symfonyOW`.
- Server-side auth, proxying `/api` through Next, and `proxy.ts` route guards. The API's cookie lives on its own origin, so the server cannot see it.
- Caching or ISR for public pages. They render dynamically, as in Nuxt.
- New features beyond what `nuxtOW` has.

## Feature parity checklist

Source of truth: `nuxtOW/app/**`.

- **Layout:** sticky nav plus a centered `container` main area (max 1200px, 16px gutter, 24px top / 48px bottom padding).
- **Nav:**
  - Light/dark logo swap and Home / Search links. The active link is bold with text color, inactive links are muted, and it matches the exact path only.
  - Auth area, rendered only once auth is ready:
    - signed in: avatar (28px) plus username or email linking to `/profile`, and a logout icon button that logs out and goes to `/`;
    - signed out: "Log in" and a primary "Sign up" button.
  - Theme toggle: a sun icon in dark mode, a moon icon in light mode, with a title tooltip.
  - Below 640px, text labels are hidden.
- **`/` Home:**
  - Hero with the heading "Find your next anime" and a search form that navigates to `/search?q=…`, dropping `q` when blank.
  - Stats line (anime / genres / studios, `toLocaleString`).
  - Three sections (Trending/fire, Top rated/trophy, Recently aired/clock), each an AnimeCard grid, or "Nothing here yet." when empty.
  - Loading state, plus an error state with Retry.
- **`/search`:**
  - The URL (`q`, `page`) is the source of truth.
  - The input is prefilled from `q`, re-syncs when the URL changes, and is autofocused.
  - Typing debounces 350 ms, then replaces the URL, resetting to page 1. Submitting searches immediately.
  - Summary line: "N result(s) for “term”", with a spinner while pending.
  - Results grid dims to 0.6 opacity while pending.
  - Error, loading and "No anime found." states.
  - Prev / Next pagination with "Page x / y", scrolling to the top. Limit is 30.
- **`/anime/[id]`:**
  - Banner: the `bannerUrl` image, else `coverColor`, else surface-2.
  - Poster overlaps the banner.
  - Title (English, else romaji), plus alt titles (romaji when it differs, native).
  - Scores: star %, users popularity, heart favourites.
  - Genre tags, and AniList / MAL external links.
  - Facts sidebar with 11 facts, hiding empty ones. The formatting follows `format.ts`.
  - Synopsis as plain text with preserved line breaks.
  - YouTube-nocookie trailer.
  - Characters (first 12, "Show all N" / "Show less" toggle) with role and voice actor.
  - Staff (first 8, same toggle).
  - Tab title is "<title> · OnlyWeebs".
  - 404 shows "This anime does not exist." and other errors show "Could not load this anime.", both with a "Back to search" button.
  - Responsive: at 768px and below, the header stacks, the poster shrinks to 140px and the layout becomes one column.
- **`/login`:**
  - Email, password with show/hide toggle, and a "Remember me" checkbox (sent as `_remember_me`).
  - API error message shown in an alert.
  - Spinner on submit.
  - Redirects to the `redirect` query param only when it is an in-app path (starts with `/`, not `//`), otherwise to `/`.
  - An already signed-in user is redirected.
  - The link to `/register` keeps the query string.
- **`/register`:**
  - Email, password with show/hide toggle, and confirm password.
  - Live password rules: 12+ characters, uppercase, lowercase, digit, special character.
  - Mismatch message while typing.
  - Client-side checks run before submit.
  - API field violations are mapped to fields; otherwise the error shows in an alert.
  - On success: log in, then go to `/`.
  - An already signed-in user is redirected to `/`.
  - The link to `/login` keeps the query string.
- **`/profile`** (auth required; signed-out users are redirected to `/login?redirect=/profile`):
  - Account card: 96px avatar, name, email when a username exists, "Member since", and an Admin tag for `ROLE_ADMIN`.
  - Upload card:
    - Drag-and-drop or click dropzone.
    - Client checks: JPEG, PNG or WebP only; 5 MB or smaller; 2000×2000px or smaller, with an explicit dimensions message. An unreadable image shows an error.
    - Round preview, with the file name, Cancel and Upload buttons.
    - Upload is `POST /me/profile-picture` (multipart field `profile_picture`). It updates the user in the auth context, which updates the nav avatar, then shows the success message.
    - Object URLs are revoked when replaced and on unmount.
- **Head:** default title "OnlyWeebs", `lang="en"`, `favicon.ico`, apple-touch-icon `/images/favicon.png`, per-page titles "Log in · OnlyWeebs", "Sign up · OnlyWeebs", "Profile · OnlyWeebs", "Search · OnlyWeebs".

## Architecture

```
app/
  layout.tsx              <html lang="en" suppressHydrationWarning>; <Providers>; <Nav>; <main className="container">
  providers.tsx           'use client' — ThemeProvider (next-themes) + AuthProvider
  globals.css             Tailwind import, @theme tokens, light/dark variables, @layer base/components
  loading.tsx             shared spinner state
  error.tsx               'use client' — shared error state with Retry (retry())
  page.tsx                Home (RSC): hero + <Suspense><HomeContent/></Suspense>
  search/page.tsx         Search (RSC; awaits searchParams)
  search/SearchView.tsx   'use client' — owns the transition: SearchBox + dimmed results wrapper + pending spinner
  anime/[id]/page.tsx     Detail (RSC; generateMetadata)
  anime/[id]/not-found.tsx
  anime/[id]/error.tsx    'use client' — "Could not load this anime." + back link
  login/page.tsx          server: metadata → <LoginForm/>
  register/page.tsx       server: metadata → <RegisterForm/>
  profile/page.tsx        server: metadata → <ProfileView/>
components/
  Nav.tsx, ThemeToggle.tsx            client
  AnimeCard.tsx, AnimePoster.tsx      server-compatible (no hooks)
  UserAvatar.tsx                      server-compatible
  PeopleList.tsx                      client — expandable characters/staff list
  RetryButton.tsx                     client — router.refresh() in a transition
  LoginForm.tsx, RegisterForm.tsx, ProfileView.tsx   client
lib/
  types.ts        copied verbatim from nuxtOW/app/utils/types.ts
  format.ts       humanize, formatDate, plainText, apiErrorMessage, apiFieldErrors
  api.ts          API_BASE, ApiError, apiFetch<T>()
  auth.tsx        AuthProvider, useAuth()
  password.ts     passwordRules(pw) → {label, ok}[]; isStrongPassword(pw)
```

The `@/*` path alias maps to the project root (already in `tsconfig.json`).

### `lib/api.ts`

- `API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'`.
- `apiFetch<T>(path, init?)` fetches `${API_BASE}${path}` with `credentials: 'include'` and `Accept: application/json`.
  - A plain-object `body` is JSON-encoded, with the `Content-Type` header set. A `FormData` body is passed through unchanged.
  - A non-2xx response throws `new ApiError(status, problem)`, where `problem` is the parsed JSON body or `undefined`.
  - Returns the parsed JSON, or `undefined` for a 204 or empty body.
- `ApiError extends Error { status: number; data?: ApiProblem }`. The `data` field keeps `apiErrorMessage` and `apiFieldErrors` identical to the Nuxt versions, which read `error.data`.
- Works in both Server and Client Components.

### Server pages

- **Home:** `page.tsx` renders the hero heading and the `<Form action="/search">` synchronously. Below them, `<Suspense fallback={<Loading/>}>` wraps an async `HomeContent` component.
  - `HomeContent` awaits `apiFetch<{data: HomeData}>('/home')` and renders the stats line and the three sections.
  - On failure, `HomeContent` catches the error itself and renders the error state with a client `RetryButton` (`router.refresh()` inside `startTransition`, with a spinner while pending). The hero stays visible in the loading and error states, as in Nuxt.
- **Search:** awaits `searchParams`, computes `term` and `page` (`Math.max(1, Number(page) || 1)`), fetches `/animes?page=&limit=30[&searchTerm=]`, and passes `{term, data}` to `SearchView`.
- **Detail:** `getAnime = cache(async (id) => apiFetch(...))` from React is shared by `generateMetadata` and the page. A 404 `ApiError` calls `notFound()`. Other errors throw to `anime/[id]/error.tsx`.

### Search interactivity (`SearchView`)

- `const [isPending, startTransition] = useTransition()`.
- `updateQuery(q, p = 1)` builds `?q=&page=` (dropping empty and page-1 values) and calls `router.replace` inside `startTransition`.
- The input state re-syncs from the `term` prop when the URL changes, and the debounce timer is cleared when that happens.
- Pagination buttons call `updateQuery(term, p)`, then `window.scrollTo({top: 0, behavior: 'smooth'})`.
- The grid gets `opacity-60` while `isPending`.

### Auth (`lib/auth.tsx`)

- State: `user: User | null`, `ready: boolean`.
- On mount it calls `apiFetch('/me')`. Success sets the user, failure sets `null`, and `ready` becomes `true` either way.
- `login(email, password, rememberMe)` posts `/auth/login` with `{email, password, _remember_me}` and sets the user.
- `register(email, password)` posts `/auth/register`.
- `logout()` posts `/auth/logout`, and clears the user in a `finally`.
- `setUser(user)` is used after the avatar upload.
- `useAuth()` throws when used outside the provider.
- Redirect helpers in the forms: `safeRedirect(value)` returns the value if it starts with `/` and not `//`, else `/`. It lives in `lib/format.ts` so it can be unit-tested.

### Styling

- `globals.css` defines the Nuxt CSS variables on `:root` and `:root[data-theme='dark']`, with the exact same values as `nuxtOW/app/assets/css/main.css`.
  - `@theme inline` exposes them as Tailwind colors: `bg`, `surface`, `surface-2`, `text`, `muted`, `border`, `primary`, `primary-contrast`, `danger`, `success`, `star` (#f5b301). It also exposes `--radius` (10px) and `--shadow`.
- A Tailwind custom variant `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` lets components use `dark:` where needed.
- `@layer base`: body font (system-ui stack), line-height 1.5, background and text colors, link color with underline on hover, block images, heading line-height.
- `@layer components`: `.container`, `.btn`, `.btn-primary`, `.btn-icon`, `.input`, `.field`, `.field-error`, `.alert`, `.card`, `.tag`, `.grid-cards` (auto-fill 160px), `.state`, `.light-only` / `.dark-only`. These are reused everywhere, so they stay semantic classes. Everything else uses utility classes inline.
- Font Awesome: import `@fortawesome/fontawesome-svg-core/styles.css` in the root layout and set `config.autoAddCss = false`, so there's no icon flash on SSR. Spinners use the `spin` prop.

### Images

- The logo and default avatars use `next/image` with explicit width and height.
- API images (`ImageVariant`: posters, profile pictures) use `<picture><source type="image/webp" srcSet={webp}/><img src={default} loading="lazy"/></picture>`. The `@next/next/no-img-element` lint rule is disabled per line, with a comment explaining that the API already resizes these images and serves webp.
- AniList images (character and staff photos) use plain `<img loading="lazy">` with the same lint exception. The banner is a CSS `background-image`.
- `UserAvatar` treats a missing image, or one whose `default` ends with `/images/defaultProfileImage.png`, as the default. In that case it renders the light and dark default images, with the theme-only classes.

## Error handling

- Server fetch failures go to the route error boundaries. Detail 404s go to `not-found.tsx`.
- Client form errors come from `apiErrorMessage` or `apiFieldErrors` on the `ApiError`, with the same fallbacks as Nuxt.
- Auth `/me` failures always mean "signed out". They never surface as an error.

## Testing

Vitest with jsdom, `@testing-library/react`, `@testing-library/user-event` and `@vitejs/plugin-react`, with an `@/` alias. Scripts: `test` (run once) and `test:watch`.

- `lib/format.test.ts` covers:
  - `humanize`: acronyms, underscores, null.
  - `formatDate`: null gives `?`.
  - `plainText`: `<br>` becomes a newline; tags and entities are stripped; three or more newlines collapse.
  - `apiErrorMessage`: detail, then title, then fallback.
  - `apiFieldErrors`.
  - `safeRedirect`.
- `lib/password.test.ts` covers each rule and `isStrongPassword`.
- `lib/api.test.ts` mocks `fetch` and covers: JSON body encoding, FormData passthrough, `ApiError` on non-2xx with the parsed problem, and 204 returning `undefined`.
- `app/search/SearchView.test.tsx` mocks `next/navigation` and uses fake timers. It covers the 350 ms debounce, immediate submit, and the page param dropped when it's 1.
- `components/RegisterForm.test.tsx` mocks auth and covers:
  - rules update live;
  - the mismatch message;
  - a weak password blocks submit;
  - API violations are mapped to fields.

Verification before calling it done: `npm run lint`, `npm test`, `npm run build`, and a manual browser pass of every route in both themes against the running Symfony API.

## Housekeeping

- Remove the create-next-app leftovers: `public/*.svg`, the Geist fonts, and the boilerplate `page.tsx` content.
- Copy `nuxtOW/public/{favicon.ico,robots.txt,images/}` into `react-ow/public/`, and delete `app/favicon.ico` in favor of the public one.
- Rewrite the README: routes-to-API table, setup, `NEXT_PUBLIC_API_BASE`, and the CORS note, since the API's `CORS_ALLOW_ORIGIN` must include this app's origin.
- Keep the `AGENTS.md` block as generated.
