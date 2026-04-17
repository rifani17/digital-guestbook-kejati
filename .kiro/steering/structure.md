# Project Structure

```
digital-guestbook-kejati/
├── frontend/                        # React SPA (all active code lives here)
│   ├── public/                      # Static assets, index.html
│   ├── src/
│   │   ├── App.js                   # Root component, router setup
│   │   ├── index.js                 # Entry point
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn UI components (do not edit manually)
│   │   │   ├── CameraCapture.js     # Webcam photo capture component
│   │   │   └── ProtectedRoute.js    # Auth guard wrapper for admin routes
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # Global Supabase auth state
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   ├── supabase.js          # Supabase client (single instance)
│   │   │   └── utils.js             # cn() helper (clsx + tailwind-merge)
│   │   └── pages/
│   │       ├── VisitorForm.js       # Public guest registration form
│   │       ├── AdminLogin.js        # Admin login page
│   │       ├── AdminDashboard.js    # Visitor data table + stats + realtime
│   │       ├── AdminPejabat.js      # CRUD for officials
│   │       └── AdminJabatan.js      # CRUD for positions
│   ├── .env                         # Local env vars (not committed)
│   ├── craco.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   ├── database_schema.sql          # Main schema (jabatan, pejabat, tamu)
│   ├── add_foto_ktp_column.sql      # Migration: added foto_ktp_url
│   ├── storage_policies.sql         # RLS policies for storage buckets
│   └── storage_setup.sql            # Bucket creation
├── docs/                            # Project documentation (markdown)
├── memory/
│   └── PRD.md                       # Product requirements reference
├── design_guidelines.json           # Design system spec ("Swiss Digital Bureau")
└── tests/                           # Python test stubs (mostly empty)
```

## Conventions

- **Pages** are full-route components in `src/pages/`. One file per route.
- **Shadcn components** in `src/components/ui/` are generated — prefer extending via props/variants rather than editing directly.
- **All Supabase calls** go through the singleton in `src/lib/supabase.js`. Never create a second client.
- **Auth state** is consumed via `useAuth()` hook from `AuthContext`. Never read Supabase session directly in pages.
- **Named exports** are used for pages and components (e.g. `export const VisitorForm`).
- **Tailwind only** for styling — no CSS modules, no inline style objects unless absolutely necessary.
- **`cn()` utility** from `src/lib/utils.js` for conditional class merging.
- Database schema changes go in `database/` as separate `.sql` migration files.
