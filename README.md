# 🍽️ HarianKu
> **Web App Mobile-First untuk Konsistensi Hidup Sehat & Teratur**

**HarianKu** adalah aplikasi web berbasis *mobile-first* yang dirancang untuk membantu Anda menjalani rutinitas harian dengan lebih terencana dan menyenangkan. Dari merencanakan menu masak mingguan, mengelola stok dapur secara otomatis, hingga mencatat aktivitas olahraga harian demi mempertahankan *streak* mingguan Anda.

---

## 🌟 Fitur Utama

- **Onboarding Cerdas**: Memandu pengguna baru menentukan preferensi hidup sehat (*Makan Sehat*, *Aktif Olahraga*, atau keduanya) disertai 10+ resep bawaan (starter recipes).
- **Meal Planner Mingguan**: Susun agenda makanan mingguan (Sarapan, Makan Siang, Makan Malam, Camilan) dengan antarmuka yang bersih dan interaktif.
- **Stok Dapur & Pengurangan Otomatis**: Kelola persediaan bahan makanan di rumah. Saat Anda menandai resep sebagai "Sudah Dimasak", stok bahan dalam resep tersebut otomatis berkurang.
- **Catatan Belanja Pintar**: Menghitung secara agregat kebutuhan bahan makanan untuk minggu ini secara otomatis dengan membandingkan rencana menu makan terhadap sisa stok dapur.
- **Workout Tracker**: Jadwalkan sesi olahraga mingguan dan pertahankan streak dengan mengunggah foto bukti aktivitas Anda.
- **Sistem Motivasi & Streak**: Dapatkan lencana pencapaian (badges) dan klaim hadiah mingguan yang menarik saat Anda menjaga konsistensi.
- **Panduan Pengguna Interaktif (Tour Guide)**: Bantuan langkah-demi-langkah interaktif menggunakan **Driver.js** saat pertama kali menggunakan dasbor.
- **Panel Admin Lengkap**: Panel khusus admin untuk mengelola user, melihat statistik, mengatur hadiah, memantau resep starter, serta mengonfigurasi kategori bawaan.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Bahasa**: TypeScript
- **Styling**: TailwindCSS & Custom CSS
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Animasi & Interaktivitas**: Framer Motion, Canvas Confetti
- **Panduan/Tour**: Driver.js (dengan tema khusus HarianKu)
- **Komponen & Ikon**: Lucide React, Sonner (Toaster)

---

## 🚀 Memulai Pengembangan

### Prasyarat
Pastikan Anda menggunakan Node.js versi 20 ke atas. Jika menggunakan `nvm`, jalankan:
```bash
nvm use 20
```

### 1. Kloning Proyek & Instalasi Dependensi
```bash
git clone <url-repositori-harianku>
cd harianku
npm install
```

### 2. Konfigurasi Environment Variables
Buat file `.env` di direktori utama proyek Anda dan isi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Jalankan Server Development
Jalankan server lokal dengan Next Turbopack:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

### 4. Build Produksi
Untuk memeriksa kesiapan kode dan membuat bundel produksi:
```bash
npm run build
```

---

## 📂 Struktur Proyek

```text
src/
├── app/                  # Next.js App Router (Halaman & API Routes)
│   ├── (auth)/           # Halaman login, signup, dan onboarding
│   ├── (main)/           # Modul dashboard, resep, stok, planner, workout, dan profil
│   ├── admin/            # Dashboard dan kontrol panel administrator
│   ├── api/              # Endpoint API backend (Supabase database operations)
│   ├── layout.tsx        # Layout root
│   └── page.tsx          # Landing page
├── components/           # Reusable UI Components
│   └── ui/               # Komponen kustom (CustomComponents, BottomNav, dll)
├── lib/                  # Helper fungsi, utils, dan integrasi API
│   ├── quotes.ts         # Koleksi kata motivasi harian
│   └── supabase/         # Inisialisasi client & server Supabase
└── public/               # Static assets (gambar, ikon, logo)
```

---

## 📝 Kontribusi
1. Lakukan *fork* pada repositori ini.
2. Buat *branch* fitur baru Anda (`git checkout -b fitur/fitur-baru`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. Push ke branch tersebut (`git push origin fitur/fitur-baru`).
5. Buat *Pull Request*.
