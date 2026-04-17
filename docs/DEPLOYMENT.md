# Deployment

## Vercel (Rekomendasi)

### Via Dashboard

1. Login ke [vercel.com](https://vercel.com)
2. Import repository `rifani17/digital-guestbook-kejati`
3. Konfigurasi:
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
4. Tambah Environment Variables:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy

Setiap push ke branch `main` akan trigger auto-deploy.

### Via CLI

```bash
npm install -g vercel
cd frontend
vercel --prod
```

---

## Netlify

1. Import repository di [netlify.com](https://netlify.com)
2. Konfigurasi build:
   - Base directory: `frontend`
   - Build command: `yarn build`
   - Publish directory: `frontend/build`
3. Tambah environment variables yang sama seperti di atas
4. Deploy

---

## Build Manual

```bash
cd frontend
yarn build
```

Output di `frontend/build/` — bisa di-serve ke static hosting manapun.

---

## Custom Domain

Setelah deploy, tambahkan domain di Vercel/Netlify dashboard dan update DNS sesuai instruksi provider.

Untuk domain pemerintah (`.go.id`), pastikan HTTPS aktif — ini wajib untuk Camera API berfungsi.

---

## Rollback

**Vercel**: Dashboard → Deployments → pilih deployment lama → Promote to Production.

---

## Checklist Pre-Deploy

- [ ] Environment variables sudah diset di platform deployment
- [ ] Database schema sudah dijalankan di Supabase production
- [ ] Storage buckets sudah dibuat
- [ ] Admin user sudah dibuat
- [ ] Test form submission di production URL
- [ ] Test admin login di production URL
- [ ] Kamera berfungsi (butuh HTTPS)
- [ ] Password admin sudah diganti dari default
