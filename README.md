# Digital Guest Book - Buku Tamu Digital

Sistem manajemen pengunjung profesional untuk Kejaksaan Tinggi Kalimantan Utara.

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 16+ and npm/yarn
- Git
- Supabase account (free tier available)

### 1. Clone Repository

```bash
git clone https://github.com/rifani17/digital-guestbook-kejati.git
cd digital-guestbook-kejati
```

### 2. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get Supabase Credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

### 4. Setup Database

Run the SQL schema in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents from `database_schema.sql`
4. Run the query

### 5. Setup Storage

Create storage bucket for photos:

1. Supabase Dashboard → Storage
2. Create new bucket: `guest-photos`
3. Make it **PUBLIC** ✓
4. (Optional) Run `storage_setup.sql` for policies

### 6. Create Admin User

In Supabase Dashboard → Authentication → Users:

- Click "Add user" → "Create new user"
- Email: `admin@guestbook.local`
- Password: `admin123` (or your choice)
- Auto Confirm User: ON ✓

### 7. Run Development Server

```bash
npm start
# or
yarn start
```

The app will open at `http://localhost:3000`

## 📱 Application Routes

### Public Routes
- `/form` - Visitor registration form (default homepage)

### Admin Routes (Login Required)
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Dashboard with statistics and visitor chart
- `/admin/tamu/new` - Manual visitor registration
- `/admin/pejabat` - Manage officials
- `/admin/jabatan` - Manage positions

## 🏗️ Project Structure

```
digital-guestbook-kejati/
├── frontend/                    # React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── CameraCapture.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── VisitorForm.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminTamuNew.js
│   │   │   ├── AdminPejabat.js
│   │   │   └── AdminJabatan.js
│   │   ├── lib/
│   │   │   └── supabase.js    # Supabase client
│   │   ├── hooks/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── tailwind.config.js
├── database_schema.sql         # Database setup
├── storage_setup.sql          # Storage policies
├── README.md
└── Documentation files...
```

## 🔧 Tech Stack

- **Frontend**: React 19 + React Router 7
- **Styling**: TailwindCSS + Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Date**: date-fns
- **Camera**: react-webcam
- **Notifications**: Sonner

## 📊 Features

### Visitor Management
- ✅ Self-registration form with optional photo capture
- ✅ Photo optimization (resize to 720px, convert to WebP)
- ✅ Dropdown selection of available officials
- ✅ Real-time official status display

### Admin Dashboard
- ✅ Real-time visitor statistics
- ✅ Interactive visitor chart (today/week/month views)
- ✅ Official availability monitoring
- ✅ WhatsApp notification integration
- ✅ Mobile-responsive with hamburger menu

### Official Management
- ✅ Add, edit, delete officials
- ✅ Status management (Di Tempat/Rapat/Dinas Luar)
- ✅ Position assignment

### Position Management
- ✅ Add, edit, delete positions
- ✅ Hierarchical organization

### Additional Features
- ✅ Branding with Kejaksaan logo
- ✅ Professional green/gold color scheme
- ✅ Full Indonesian language support
- ✅ PWA-ready
- ✅ Photo optional (resilient to storage errors)

## 🗄️ Database Schema

### Tables

**jabatan** (Positions)
- `id_jabatan` (UUID, PK)
- `nama_jabatan` (TEXT)
- `created_at` (TIMESTAMP)

**pejabat** (Officials)
- `id_pejabat` (UUID, PK)
- `id_jabatan` (UUID, FK)
- `nama` (TEXT)
- `no_hp` (TEXT)
- `status` (TEXT: di_tempat, rapat, dinas_luar)
- `created_at` (TIMESTAMP)

**tamu** (Visitors)
- `id_tamu` (UUID, PK)
- `tanggal` (TIMESTAMP)
- `nama` (TEXT)
- `asal` (TEXT)
- `no_hp` (TEXT)
- `keperluan` (TEXT)
- `tujuan_pejabat` (UUID, FK)
- `foto_url` (TEXT, nullable)
- `jumlah_pengikut` (INTEGER, nullable)
- `created_at` (TIMESTAMP)

## 🔐 Security

- Row Level Security (RLS) enabled
- Public access for visitor registration
- Authenticated access for admin features
- Storage bucket policies for photo uploads
- Protected admin routes

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Environment Variables:
     ```
     REACT_APP_SUPABASE_URL=your-url
     REACT_APP_SUPABASE_ANON_KEY=your-key
     ```
4. Deploy

### Deploy to Netlify

1. Push code to GitHub
2. Import repository in Netlify
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Base directory: `frontend`
4. Add environment variables
5. Deploy

## 📝 Initial Setup Checklist

After installation, complete these steps:

- [ ] Run `database_schema.sql` in Supabase
- [ ] Create `guest-photos` storage bucket (public)
- [ ] Create admin user in Supabase Auth
- [ ] Add at least one jabatan (position)
- [ ] Add at least one pejabat (official)
- [ ] Test visitor form submission
- [ ] Verify data appears in admin dashboard

## 🔍 Troubleshooting

### "Tabel belum dibuat" error
→ Run `database_schema.sql` in Supabase SQL Editor

### Photo upload fails
→ Ensure `guest-photos` bucket exists and is PUBLIC

### "Belum ada data pejabat"
→ Login to admin and add positions and officials

### Admin login fails
→ Create user in Supabase Auth with Auto Confirm ON

### Detailed troubleshooting
→ See `TROUBLESHOOTING.md`

## 📚 Documentation

- `README.md` - This file
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICK_REFERENCE.md` - URLs and credentials
- `DEPLOYMENT.md` - Deployment guide
- `TROUBLESHOOTING.md` - Common issues
- `BRANDING.md` - Brand guidelines
- `DASHBOARD_UX_UPDATE.md` - Dashboard features
- `PHOTO_OPTIMIZATION.md` - Image handling

## 🔄 Development Workflow

### Local Development
```bash
cd frontend
npm start
```

### Build for Production
```bash
cd frontend
npm run build
```

### Test Build Locally
```bash
cd frontend
npm run build
npx serve -s build
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (iOS 14+, macOS Big Sur+)
- Mobile browsers (iOS Safari, Chrome Android)

## 📞 Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Review Supabase Dashboard logs
3. Check browser console for errors
4. Verify environment variables

## 📄 License

MIT License - Free to use for commercial and non-commercial purposes

## 🙏 Credits

- UI Components: [Shadcn UI](https://ui.shadcn.com/)
- Backend: [Supabase](https://supabase.com)
- Charts: [Recharts](https://recharts.org)
- Icons: [Lucide](https://lucide.dev)

---

**Organization**: Kejaksaan Tinggi Kalimantan Utara
**Version**: 1.4.0
**Last Updated**: March 2024

Made with ❤️ for better visitor management
