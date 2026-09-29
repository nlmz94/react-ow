# OnlyWeebs — Next.js front

Next.js 16 (App Router) front-end for the `symfonyOW` API. A port of `nuxtOW`.

## Pages

| Route          | API used                                   | Rendering                         |
| -------------- | ------------------------------------------ | --------------------------------- |
| `/`            | `GET /api/home`                            | Server Component, streamed        |
| `/search`      | `GET /api/animes?searchTerm=&page=&limit=` | Server Component + client search  |
| `/anime/[id]`  | `GET /api/animes/{id}`                     | Server Component                  |
| `/login`       | `POST /api/auth/login`                     | Client form                       |
| `/register`    | `POST /api/auth/register` (then logs in)   | Client form                       |
| `/profile`     | `POST /api/me/profile-picture`             | Client, signed-in only            |

The nav bar loads the current user from `GET /api/me` in the browser, logs out via `POST /api/auth/logout`,
and has a light/dark switcher (`next-themes`, saved in `localStorage`, defaults to the OS preference).
Icons are Font Awesome Free via `@fortawesome/react-fontawesome`; styling is Tailwind CSS 4.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

The API base URL defaults to `http://localhost:8000/api`; override it with:

```bash
NEXT_PUBLIC_API_BASE=https://api.example.com/api npm run dev
```

`NEXT_PUBLIC_*` values are inlined at build time, so set it before `npm run build` too.

Auth uses the Symfony session cookie on the API's origin, so the API's `CORS_ALLOW_ORIGIN` must match this app's origin.

## Scripts

```bash
npm run lint        # ESLint
npm run typecheck   # next typegen + tsc
npm test            # Vitest (unit + component tests)
npm run build       # production build
npm start           # serve the build
```
