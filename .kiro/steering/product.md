# Product: Buku Tamu Digital

Digital visitor management system for Kejaksaan Tinggi Kalimantan Utara (North Kalimantan Attorney General's Office). Replaces manual guest books with a tablet-optimized self-registration kiosk and a real-time admin dashboard.

## User Roles

- **Guest (public)** — Self-registers via `/form` on a reception tablet. No login required.
- **Admin (authenticated)** — Monitors and manages visitor data, officials, and positions via `/admin/*`.

## Core Flows

1. Visitor fills form at `/form` → optional camera photo + KTP upload → data saved to Supabase
2. Admin logs in at `/admin/login` → views live dashboard, manages pejabat/jabatan, edits/deletes records
3. Dashboard auto-refreshes via Supabase Realtime on `tamu` table changes

## Key Domain Terms (Indonesian)

| Term | Meaning |
|---|---|
| tamu | guest/visitor |
| pejabat | official (person being visited) |
| jabatan | position/department |
| asal | origin / institution |
| keperluan | purpose of visit |
| foto KTP | ID card photo |
| di_tempat / rapat / dinas_luar | official status: present / in meeting / on duty travel |
