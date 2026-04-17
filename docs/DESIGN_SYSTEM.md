# Design System

## Identitas Visual

Aplikasi menggunakan tema **Kejaksaan Tinggi Kalimantan Utara** dengan palet warna hijau emerald dan aksen emas/amber yang mencerminkan identitas instansi pemerintah.

**Logo**: `https://customer-assets.emergentagent.com/job_visitor-hub-15/artifacts/rpzl1xbx_logo-kejati.png`

---

## Palet Warna

| Token | Nilai | Penggunaan |
|---|---|---|
| Primary | `emerald-700` (#047857) | Header, tombol utama, aksen |
| Primary Hover | `emerald-800` | Hover state tombol |
| Accent | `amber-500` (#F59E0B) | Tombol CTA utama (Tambah Tamu) |
| Background | `slate-50` → `slate-100` | Background halaman |
| Surface | `white` | Card, form |
| Text Primary | `slate-900` | Heading, label |
| Text Secondary | `slate-600` | Body text, deskripsi |
| Text Muted | `slate-500` | Placeholder, caption |
| Border | `slate-200` | Border card, input |
| Success | `green-500` (#10B981) | Status di tempat, konfirmasi |
| Warning | `yellow-500` | Status rapat |
| Danger | `red-500` | Status dinas luar, hapus |

### CSS Variables (index.css)

```css
:root {
  --primary: 160 84% 39%;    /* emerald-700 */
  --accent: 45 93% 47%;      /* amber-400 */
  --ring: 160 84% 39%;
}
```

---

## Tipografi

Font: **Inter** (system-ui fallback)

| Skala | Class Tailwind | Penggunaan |
|---|---|---|
| H1 | `text-4xl font-bold tracking-tight` | Judul halaman |
| H2 | `text-3xl font-semibold tracking-tight` | Judul section |
| H3 | `text-2xl font-medium` | Judul card |
| Body | `text-base leading-relaxed text-slate-600` | Konten |
| Caption | `text-sm text-slate-500 uppercase tracking-widest` | Label, metadata |

---

## Komponen Utama

### Button

```jsx
// Tombol utama (submit, aksi primer)
<Button className="bg-emerald-700 hover:bg-emerald-800 text-white h-12">

// Tombol CTA (Tambah Tamu)
<Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">

// Tombol outline (aksi sekunder)
<Button variant="outline" className="bg-white/10 border-white/20 text-white">

// Tombol destruktif
<Button variant="outline" className="text-red-600 hover:border-red-300">
```

Semua tombol interaktif harus memiliki `min-h-[44px]` untuk touch target yang memadai.

### Card

```jsx
<Card className="shadow-sm border-slate-200 rounded-xl">
  <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-t-xl">
  <CardContent className="p-6 md:p-8">
```

### Input

Tinggi standar `h-12` untuk semua input form agar touch-friendly di tablet.

### Status Badge

```jsx
// Di Tempat
<span className="bg-green-100 text-green-800 border-green-200 px-3 py-1 rounded-full text-xs font-medium border">

// Rapat
<span className="bg-yellow-100 text-yellow-800 border-yellow-200 ...">

// Dinas Luar
<span className="bg-red-100 text-red-800 border-red-200 ...">
```

---

## Layout

### Header Admin

```jsx
<div className="bg-gradient-to-r from-emerald-700 to-emerald-800 border-b border-emerald-900">
```

Berisi: logo (48px), nama organisasi, navigasi desktop, hamburger menu mobile.

### Ukuran Logo

| Konteks | Ukuran |
|---|---|
| Login page | 192×192px |
| Visitor form | 96×96px |
| Admin header | 48×48px |

### Responsive Breakpoints

| Breakpoint | Lebar | Layout |
|---|---|---|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768–1024px | 2 kolom, navigasi penuh |
| Desktop | > 1024px | 3 kolom, layout penuh |

---

## Aturan Desain

- Jangan gunakan gradient pada teks
- Semua elemen interaktif harus `cursor-pointer`
- Semua input dan tombol harus memiliki `data-testid`
- Touch target minimum: `min-h-[44px] min-w-[44px]`
- Prioritaskan mobile-first: form harus berfungsi sempurna di lebar 375px
