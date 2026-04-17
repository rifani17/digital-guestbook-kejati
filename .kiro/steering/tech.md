# Tech Stack

## Frontend
- **React 19** with JavaScript (no TypeScript)
- **React Router DOM 7** — client-side routing
- **TailwindCSS 3.4** — utility-first styling
- **Shadcn UI** (Radix UI primitives) — component library, files live in `frontend/src/components/ui/`
- **Lucide React** — icons
- **Sonner** — toast notifications
- **Recharts 3** — charts on admin dashboard
- **React Webcam 7** — camera capture
- **date-fns + date-fns-tz** — date formatting with timezone support
- **React Hook Form + Zod** — form handling and validation

## Backend (BaaS)
- **Supabase** — PostgreSQL database, Auth (email/password), Storage, Realtime
- No separate backend server. All data operations happen client-side via `@supabase/supabase-js`

## Build System
- **Create React App** + **Craco** (config override)
- Package manager: **Yarn**

## Environment Variables
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```
Defined in `frontend/.env` (not committed). See `frontend/.env.example`.

## Common Commands
All commands run from the `frontend/` directory.

```bash
yarn install        # install dependencies
yarn start          # dev server (craco start)
yarn build          # production build (craco build)
yarn test           # run tests (craco test)
```

## Supabase Client
Initialized once in `frontend/src/lib/supabase.js` and imported wherever needed:
```js
import { supabase } from '../lib/supabase'
```

## Image Processing
Photos are resized client-side (max 720px, WebP 85%) using Canvas API before uploading to Supabase Storage. Two buckets: `guest-photos` and `ktp-photos` (both public).
