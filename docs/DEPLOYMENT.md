# 🚀 Deployment Checklist & Git Instructions

## ✅ Pre-Deployment Checklist

Sebelum push ke GitHub dan deploy, pastikan:

- [x] ✅ Frontend berjalan tanpa error
- [x] ✅ Semua routes tersedia (/form, /admin/*)
- [x] ✅ Supabase credentials sudah dikonfigurasi
- [x] ✅ Design mengikuti guideline (blue/gray professional)
- [x] ✅ Bahasa Indonesia untuk semua UI
- [ ] ⏳ Database schema sudah dijalankan di Supabase
- [ ] ⏳ Storage bucket sudah dibuat
- [ ] ⏳ Admin user sudah dibuat
- [ ] ⏳ Test form submission berhasil
- [ ] ⏳ Test admin login berhasil

**Note**: Item dengan ⏳ harus dilakukan oleh user di Supabase Dashboard

## 📦 Git Repository Setup

### Step 1: Initialize Git (if not done yet)

```bash
cd /app
git init
git branch -M main
```

### Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/rifani17/digital-guestbook-kejati.git
```

### Step 3: Prepare Files

Pastikan file `.gitignore` sudah benar:
```bash
cat /app/.gitignore
```

Should include:
```
node_modules/
.env
.env.local
build/
dist/
```

### Step 4: Stage All Files

```bash
git add .
```

### Step 5: Commit

```bash
git commit -m "Initial commit: Digital Guest Book MVP

Features:
- Visitor registration form with camera capture
- Admin authentication system
- Dashboard with real-time visitor statistics
- Pejabat (officials) management
- Jabatan (positions) management
- Status monitoring (Di Tempat/Rapat/Dinas Luar)
- WhatsApp notification integration
- Photo upload to Supabase Storage
- Professional blue/gray design
- Full Indonesian language support
- Mobile and tablet responsive

Tech Stack:
- React 19 + React Router
- Supabase (Auth + Database + Storage)
- TailwindCSS + Shadcn UI
- Realtime updates
"
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

If repository already has content:
```bash
git push -u origin main --force
```

## 🌐 Vercel Deployment

### Option A: Deploy via Vercel Dashboard

1. **Login to Vercel**: https://vercel.com/login
2. **Import Project**:
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose: `rifani17/digital-guestbook-kejati`
3. **Configure Project**:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: yarn build (auto-detected)
   Output Directory: build (auto-detected)
   Install Command: yarn install (auto-detected)
   ```
4. **Environment Variables**:
   Add these variables:
   ```
   REACT_APP_SUPABASE_URL=https://vlwjxhthbjueegbsdieu.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_8oXiO9osbQqUbHY15DWgeQ_L9k5hs_I
   ```
5. **Deploy**: Click "Deploy"
6. **Wait**: ~2-3 minutes for first deployment

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /app/frontend
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: digital-guestbook-kejati
# - Directory: ./ (current directory)
# - Override settings? No
```

## 🔧 Post-Deployment Tasks

### 1. Update Environment Variables (if needed)

If you change Supabase project or credentials:

**Via Vercel Dashboard:**
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Update values
4. Redeploy

**Via Vercel CLI:**
```bash
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel --prod
```

### 2. Setup Custom Domain (Optional)

**Via Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., guestbook.kejati.go.id)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours max)

### 3. Test Production Deployment

After deployment, test:

```
✅ Visitor form: https://your-domain.vercel.app/form
✅ Admin login: https://your-domain.vercel.app/admin/login
✅ Camera capture works
✅ Photo upload works
✅ Admin dashboard accessible
✅ CRUD operations work
✅ WhatsApp button works
```

## 📱 Generate QR Code for Visitor Form

Use production URL:
```
https://your-project-name.vercel.app/form
```

QR Code generators:
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/
- https://goqr.me/

Print QR code and place at reception desk.

## 🔄 Future Updates

### To Deploy Changes:

```bash
cd /app

# Make your changes...

git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically deploy on every push to `main` branch.

### To Rollback:

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Via Vercel CLI:**
```bash
vercel rollback
```

## 🔐 Security Checklist

Before going to production:

- [ ] Change admin password from default `admin123`
- [ ] Enable 2FA on Supabase account
- [ ] Review RLS policies in Supabase
- [ ] Check storage bucket permissions
- [ ] Never commit `.env` files
- [ ] Use strong passwords for admin users
- [ ] Regular backup of database
- [ ] Monitor Supabase quota usage

## 📊 Monitoring

### Vercel Analytics (Free)
- Automatically enabled
- View at: Vercel Dashboard → Analytics

### Supabase Dashboard
- Monitor database usage
- Check storage quota
- View authentication logs
- Monitor API requests

## 🆘 Deployment Troubleshooting

### Build Failed on Vercel

**Check:**
```
1. Are all dependencies in package.json?
2. Is Root Directory set to "frontend"?
3. Are environment variables set correctly?
4. Check build logs for specific errors
```

### App Works Locally But Not on Vercel

**Check:**
```
1. Environment variables are set in Vercel
2. API URLs are not hardcoded to localhost
3. CORS settings in Supabase (if any)
4. Browser console for errors
```

### Camera Not Working on Production

**Check:**
```
1. HTTPS is enabled (required for camera API)
2. Browser permissions granted
3. SSL certificate is valid
4. Try different browser
```

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com/

---

**Ready to Deploy!** 🎉

Follow the steps above to push your code to GitHub and deploy to Vercel.
