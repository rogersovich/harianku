# PRD — HarianKu
> Versi 1.0 | Status: Draft | Mode: Solo Developer

---

## 1. Overview

### Product Summary
HarianKu adalah web app mobile-first yang membantu pengguna menjalani kebiasaan sehari-hari dengan lebih teratur — mulai dari merencanakan menu masak mingguan, mengelola stok bahan dapur, hingga menjadwalkan dan melacak aktivitas olahraga. App ini dirancang dengan UX yang ceria, minim form, dan terasa menyenangkan digunakan setiap hari.

### Problem Statement
Orang sulit konsisten menjalani kebiasaan sehat — makan terencana dan olahraga rutin — karena tidak ada satu tempat yang simpel untuk merencanakan dan melacak keduanya, dalam konteks gaya hidup dan bahan makanan lokal Indonesia. Tools yang ada terlalu kompleks, berbahasa Inggris, atau tidak memiliki konteks lokal yang relevan.

### Target User
Usia 20–35 tahun, tinggal mandiri atau berkeluarga muda, memasak sendiri minimal 3–4x seminggu, ingin hidup lebih teratur tapi tidak mau pakai app yang overwhelming. Lebih sering menggunakan HP daripada laptop.

### Success Metrics
- User membuka app minimal 3x seminggu setelah onboarding
- User berhasil mengisi meal plan untuk minggu pertama
- Minimal 1 streak workout atau masak berhasil tercapai dalam 2 minggu pertama
- Onboarding selesai dalam < 3 menit

---

## 2. Scope

### In Scope (MVP)
- Landing page sebelum login
- Onboarding flow (pilih goal + 5 resep starter)
- Library resep pribadi (CRUD + foto + kategori + tag + rating)
- Meal planner mingguan dengan slot 3+1 (Sarapan/Siang/Malam/Camilan)
- Template meal plan (buat, assign ke minggu tertentu, edit)
- Auto-repeat meal plan mingguan (on/off)
- Monthly view kalender masak
- Stok bahan dengan unit system + harga statis opsional
- Shopping list otomatis agregat dari meal plan minggu ini
- Estimasi biaya per resep dan per minggu
- Modul workout (planner, upload bukti, target mingguan)
- Streak system (masak & workout) + weekly reward
- Dashboard home yang "hidup"
- Weekly summary (AI Cloudflare) + laporan pengeluaran
- Share menu sebagai gambar (html-to-image)
- History masak per bulan
- History workout per bulan
- Halaman pencapaian (badge collection + streak history)
- Laporan pengeluaran (mingguan & bulanan, visual)
- Admin panel (kelola reward, resep starter, statistik)

### Out of Scope (Fase 2)
- Import resep dari URL eksternal
- Share resep ke teman via link publik
- Nutrisi & kalori tracker
- Harga bahan historis (price tracking)
- Social feed / explore resep orang lain
- Notifikasi push / reminder
- Native mobile app (iOS/Android)

### Asumsi
- User memiliki akun Google untuk login
- User bersedia input resep dan stok secara manual
- Koneksi internet tersedia saat menggunakan app
- Satu akun = satu user (bukan multi-user per rumah tangga di MVP)

---

## 3. User Personas

### Persona 1 — Rara, 26 tahun
**Profil:** Karyawan swasta, tinggal sendiri di kos, masak 4–5x seminggu untuk hemat.
**Kebutuhan:** Tahu mau masak apa setiap hari tanpa berpikir panjang, belanja sekali seminggu dengan daftar yang sudah jelas.
**Pain Point:** Sering beli bahan yang sudah ada di rumah, ujung-ujungnya bahan busuk karena tidak terpakai. Bosan masak yang itu-itu saja tapi bingung mau masak apa yang beda.

### Persona 2 — Dimas, 30 tahun
**Profil:** Sudah menikah, punya anak satu, WFH. Ingin hidup lebih sehat — makan lebih teratur dan olahraga konsisten.
**Kebutuhan:** Jadwal masak dan olahraga yang realistis, ada motivasi biar tidak mudah menyerah.
**Pain Point:** Sudah coba beberapa app tapi terlalu ribet di awal setup. Olahraga selalu berhenti di minggu kedua karena tidak ada yang "mengingatkan" progress-nya.

---

## 4. User Stories

### Must Have
| ID | User Story | Prioritas |
|----|-----------|-----------|
| US-001 | Sebagai user baru, saya ingin melihat penjelasan singkat tentang app ini sebelum login, agar saya tahu manfaatnya sebelum mendaftar. | Must Have |
| US-002 | Sebagai user baru, saya ingin menyelesaikan onboarding dalam hitungan menit dengan resep starter yang sudah tersedia, agar saya tidak langsung dihadapkan halaman kosong. | Must Have |
| US-003 | Sebagai user, saya ingin menambahkan resep dengan foto, bahan, dan estimasi waktu masak, agar saya punya library resep pribadi yang terorganisir. | Must Have |
| US-004 | Sebagai user, saya ingin assign resep ke slot makan tertentu (sarapan/siang/malam) di hari tertentu, agar meal plan mingguan saya tersusun rapi. | Must Have |
| US-005 | Sebagai user, saya ingin melihat di halaman utama "hari ini masak apa" secara langsung, agar saya tidak perlu navigasi jauh untuk tahu agenda masak hari ini. | Must Have |
| US-006 | Sebagai user, saya ingin mengelola stok bahan dengan satuan yang jelas, agar saya tahu persis bahan apa yang masih ada di rumah. | Must Have |
| US-007 | Sebagai user, saya ingin stok bahan berkurang otomatis saat saya menandai resep sebagai "sudah dimasak", agar saya tidak perlu update stok manual setiap kali masak. | Must Have |
| US-008 | Sebagai user, saya ingin mendapat peringatan visual jika stok bahan hampir habis, agar saya bisa berbelanja sebelum kehabisan. | Must Have |
| US-009 | Sebagai user, saya ingin melihat daftar belanja otomatis dari meal plan minggu ini dikurangi stok yang ada, agar belanja saya lebih efisien. | Must Have |
| US-010 | Sebagai user, saya ingin mencatat aktivitas olahraga harian dengan upload foto bukti, agar streak workout saya terlacak. | Must Have |
| US-011 | Sebagai user, saya ingin melihat streak masak dan workout saya di halaman utama, agar saya termotivasi untuk konsisten. | Must Have |
| US-012 | Sebagai user, saya ingin mendapat reward (badge + pesan motivasi + animasi) saat streak mingguan penuh, agar ada rasa pencapaian yang menyenangkan. | Must Have |

### Should Have
| ID | User Story | Prioritas |
|----|-----------|-----------|
| US-013 | Sebagai user, saya ingin membuat template meal plan dan assign ke minggu tertentu, agar saya tidak perlu mengisi ulang dari awal setiap minggu. | Should Have |
| US-014 | Sebagai user, saya ingin mengaktifkan auto-repeat meal plan mingguan, agar minggu berikutnya otomatis terisi sama. | Should Have |
| US-015 | Sebagai user, saya ingin melihat monthly view kalender masak, agar saya bisa lihat history masak bulan ini secara visual. | Should Have |
| US-016 | Sebagai user, saya ingin mencari dan memfilter resep di library saya, agar saya bisa menemukan resep yang tepat dengan cepat. | Should Have |
| US-017 | Sebagai user, saya ingin menerima weekly summary setiap akhir minggu, agar saya tahu recap masak, workout, dan pengeluaran minggu ini. | Should Have |
| US-018 | Sebagai user, saya ingin men-generate gambar share menu harian atau mingguan, agar saya bisa berbagi rencana masak saya di media sosial. | Should Have |
| US-019 | Sebagai user, saya ingin input harga bahan saat menambah stok, agar saya bisa tracking estimasi pengeluaran masak. | Should Have |
| US-020 | Sebagai admin, saya ingin mengkonfigurasi reward dan badge dari panel admin, agar reward bisa disesuaikan tanpa perlu ubah kode. | Should Have |

### Nice to Have
| ID | User Story | Prioritas |
|----|-----------|-----------|
| US-021 | Sebagai user, saya ingin memberi rating dan catatan pada resep setelah dimasak, agar saya punya feedback untuk masakan saya sendiri. | Nice to Have |
| US-022 | Sebagai user, saya ingin set target workout mingguan dan melihat progress bar-nya, agar saya punya goal yang terukur. | Nice to Have |
| US-023 | Sebagai user, saya ingin melihat quotes motivasi yang berbeda setiap hari di halaman utama, agar app terasa fresh setiap kali dibuka. | Nice to Have |
| US-024 | Sebagai user, saya ingin melihat history resep yang sudah pernah dimasak per bulan, agar saya bisa tahu variasi masakan saya selama ini. | Should Have |
| US-025 | Sebagai user, saya ingin melihat history workout per bulan dalam tampilan yang visual, agar saya bisa evaluasi konsistensi olahraga saya. | Should Have |
| US-026 | Sebagai user, saya ingin melihat koleksi badge dan pencapaian saya, agar saya bisa lihat progress reward yang sudah dikumpulkan. | Should Have |
| US-027 | Sebagai user, saya ingin melihat laporan estimasi pengeluaran masak mingguan dan bulanan dalam tampilan visual yang ceria, agar saya bisa mengontrol budget dapur saya. | Should Have |

---

## 5. Functional Requirements

### FR-01 — Landing Page

**Deskripsi:** Halaman pertama yang dilihat user sebelum login. Menjelaskan fungsi app secara visual dan ceria.

**Acceptance Criteria:**
- Menampilkan nama produk, tagline, dan penjelasan singkat 3 fitur utama
- Ada CTA tombol "Mulai Sekarang" dan "Login"
- Design ceria, tidak kaku, mobile-friendly
- Load time < 2 detik
- Tidak ada form apapun di halaman ini

**Edge Cases:**
- Jika user sudah login dan akses landing page → redirect ke dashboard

---

### FR-02 — Autentikasi

**Deskripsi:** Login dan register menggunakan Google OAuth via Supabase Auth.

**Acceptance Criteria:**
- User bisa login dengan akun Google dalam 1 tap
- Session persisten — tidak perlu login ulang setiap buka app
- Logout tersedia di menu settings
- Jika session expired → redirect ke landing page

**Edge Cases:**
- Jika Google OAuth gagal → tampil pesan error yang jelas
- First-time login → trigger onboarding flow

---

### FR-03 — Onboarding

**Deskripsi:** Flow singkat untuk user baru agar tidak langsung melihat halaman kosong.

**Acceptance Criteria:**
- Tampil setelah pertama kali login
- User pilih goal: "Makan Sehat", "Aktif Olahraga", atau "Keduanya"
- Setelah pilih goal, 5 resep starter langsung muncul di library resep user
- Resep starter dipilih berdasarkan konteks (misal: goal makan sehat = resep rendah kalori)
- Onboarding bisa di-skip
- Maksimal 2 screen, selesai < 3 menit

**Edge Cases:**
- Jika user skip onboarding → library resep kosong, tampil empty state dengan CTA "Tambah Resep Pertamamu"
- Onboarding hanya muncul sekali (ditandai flag `onboarding_completed` di database)

---

### FR-04 — Library Resep

**Deskripsi:** Halaman utama untuk mengelola koleksi resep pribadi user.

**Acceptance Criteria:**
- User bisa tambah resep baru dengan field: nama, deskripsi singkat, kategori, tag, estimasi waktu (opsional), foto (multiple, via Cloudinary), list bahan (nama + jumlah + satuan + harga opsional), langkah memasak
- User bisa edit dan hapus resep
- User bisa bookmark/favorit resep
- User bisa memberi rating bintang 1–5 dan catatan setelah resep ditandai "sudah dimasak"
- Foto resep: minimal 1 foto utama (wajib), bisa tambah foto hasil masak sendiri
- Tampilan default: grid card dengan foto, nama, kategori, estimasi waktu, rating
- Search real-time by nama resep
- Filter by: kategori, tag, favorit, estimasi waktu — ditampilkan sebagai chip/toggle, bukan dropdown form

**Edge Cases:**
- Jika tidak ada foto → tampil placeholder ilustrasi makanan
- Jika resep diassign ke meal plan aktif dan dihapus → tampil warning sebelum konfirmasi hapus
- Library kosong → empty state ceria dengan CTA tambah resep

---

### FR-05 — Kategori Resep

**Deskripsi:** User bisa buat kategori dengan nama dan warna custom.

**Acceptance Criteria:**
- User bisa buat, edit, hapus kategori
- Setiap kategori punya warna yang bisa dipilih dari color picker (minimal 12 preset warna)
- Di meal planner, slot resep tampil dengan warna kategorinya (color-coded)
- Kategori default tersedia: Sarapan Cepat, Masakan Berat, Menu Diet, Favorit Keluarga

**Edge Cases:**
- Jika kategori dihapus yang masih dipakai resep → resep menjadi "Tanpa Kategori"

---

### FR-06 — Meal Planner Mingguan

**Deskripsi:** Halaman untuk menjadwalkan resep ke hari dan slot makan tertentu.

**Acceptance Criteria:**
- Tampilan weekly view (Senin–Minggu)
- Setiap hari punya 4 slot: Sarapan, Makan Siang, Makan Malam, Camilan (opsional)
- User assign resep ke slot dengan cara: tap slot → drawer muncul → pilih resep dari library
- Drawer pencarian resep bisa search dan filter
- Slot yang sudah terisi tampil nama resep + warna kategori + estimasi waktu
- User bisa hapus resep dari slot dengan swipe atau long press
- User bisa tambah catatan harian per hari (notes singkat)
- Navigasi antar minggu dengan swipe kiri/kanan atau tombol prev/next

**Edge Cases:**
- Slot yang sama bisa diisi lebih dari satu resep (misal: makan siang ada 2 menu)
- Jika minggu tidak ada data → tampil empty state per hari dengan CTA assign resep

---

### FR-07 — Template Meal Plan

**Deskripsi:** User bisa simpan meal plan minggu sebagai template dan assign ke minggu lain.

**Acceptance Criteria:**
- Tombol "Simpan sebagai Template" tersedia di halaman meal planner
- User beri nama template (misal: "Makan Sehat Murah")
- Template menyimpan semua slot resep dari minggu tersebut
- User bisa lihat daftar template yang sudah dibuat
- User bisa assign template ke minggu tertentu (pilih minggu dari date picker)
- Setelah assign, user tetap bisa edit slot secara individual
- User bisa hapus template

**Edge Cases:**
- Jika assign template ke minggu yang sudah ada datanya → tampil konfirmasi "Timpa data minggu ini?"
- Jika resep di dalam template dihapus dari library → slot tersebut kosong saat template diload, tampil warning

---

### FR-08 — Auto-Repeat Meal Plan

**Deskripsi:** Fitur untuk otomatis menyalin meal plan minggu ini ke minggu berikutnya.

**Acceptance Criteria:**
- Toggle on/off tersedia di halaman meal planner
- Saat aktif, setiap Senin sistem otomatis copy meal plan minggu sebelumnya ke minggu baru
- User tetap bisa edit meal plan hasil copy
- Status auto-repeat tampil jelas di UI (chip/badge "Auto-repeat aktif")

**Edge Cases:**
- Jika minggu berikutnya sudah ada data manual → auto-repeat tidak menimpa, hanya isi slot yang kosong
- Jika auto-repeat aktif tapi tidak ada data minggu sebelumnya → tidak ada yang dicopy, tidak ada error

---

### FR-09 — Monthly View

**Deskripsi:** Tampilan kalender bulanan yang menunjukkan hari mana saja user sudah punya meal plan.

**Acceptance Criteria:**
- Tampil kalender grid bulan berjalan
- Hari yang punya meal plan ditandai dot berwarna (warna sesuai kategori resep dominan hari itu)
- Tap pada hari → muncul bottom sheet mobile-friendly berisi: ringkasan resep per slot hari itu + catatan harian (jika ada)
- Bottom sheet bisa di-dismiss dengan swipe down atau tap area luar
- Navigasi ke bulan sebelum/sesudah tersedia
- Hari ini diberi highlight khusus

**Edge Cases:**
- Hari tanpa meal plan dan tanpa catatan → tidak ada dot, tap tidak memunculkan bottom sheet
- Hari dengan catatan tapi tanpa meal plan → tetap tampil dot (warna netral) dan bottom sheet hanya berisi catatan

---

### FR-10 — Stok Bahan

**Deskripsi:** Fitur untuk mencatat dan memantau stok bahan dapur.

**Acceptance Criteria:**
- User bisa tambah bahan baru: nama, jumlah, satuan, harga per satuan (opsional), threshold minimum
- Satuan dipilih dari fixed list: gram (g), kilogram (kg), ons, mililiter (ml), liter (l), sendok makan (sdm), sendok teh (sdt), gelas, butir, biji, buah, potong, lembar, bungkus, kaleng, botol, sachet, secukupnya
- Auto-konversi satuan kompatibel: g ↔ kg, ml ↔ liter
- Bahan yang jumlahnya di bawah threshold ditampilkan dengan warning visual (warna merah/oranye + ikon)
- Stok otomatis berkurang saat user menandai resep sebagai "sudah dimasak" — jumlah dikurangi sesuai bahan di resep
- User bisa update stok manual kapan saja
- Tampilan: list/card dengan nama bahan, jumlah tersisa, satuan, status (cukup/hampir habis/habis)

**Edge Cases:**
- Jika satuan di resep berbeda dengan satuan stok tapi kompatibel (misal: resep pakai gram, stok dalam kg) → auto-konversi
- Jika satuan tidak kompatibel (misal: resep butuh "2 potong", stok dalam gram) → tidak auto-kurangi, tampil notifikasi "Satuan tidak kompatibel, update stok manual"
- Jika stok bahan tidak ada di daftar stok user → tidak error, hanya tidak auto-kurangi
- Stok tidak boleh minus — jika kurang dari 0 setelah pengurangan → set ke 0 dan tampil info

---

### FR-11 — Shopping List

**Deskripsi:** Daftar belanja otomatis berdasarkan kebutuhan meal plan minggu ini dikurangi stok yang ada.

**Acceptance Criteria:**
- Accessible dari halaman meal planner atau home
- Agregat semua bahan dari semua resep yang dijadwalkan minggu ini
- Dikurangi stok yang tersedia
- Hasil ditampilkan sebagai list: nama bahan, jumlah yang perlu dibeli, satuan
- Jika harga bahan tersedia di stok → tampil estimasi total belanja
- User bisa centang item yang sudah dibeli
- Tombol "Segarkan" untuk recalculate

**Edge Cases:**
- Jika meal plan minggu ini kosong → empty state "Isi meal plan dulu untuk generate daftar belanja"
- Jika semua bahan sudah cukup stoknya → tampil "Stokmu sudah cukup untuk minggu ini 🎉"

---

### FR-12 — Modul Workout

**Deskripsi:** Fitur untuk merencanakan dan mencatat aktivitas olahraga harian.

**Acceptance Criteria:**
- User bisa assign tipe workout ke hari tertentu: Jogging, Gym, Workout di Rumah
- User bisa upload foto bukti workout + notes opsional untuk menyelesaikan workout hari itu
- Foto diupload via Cloudinary
- Status workout per hari: Belum, Dijadwalkan, Selesai (dengan bukti)
- Workout yang sudah selesai tampil dengan checkmark dan thumbnail foto bukti
- User bisa set target workout mingguan (angka 1–7)
- Progress bar target mingguan tampil di home dan halaman workout
- History workout per bulan bisa dilihat

**Edge Cases:**
- Jika user upload foto tapi tidak simpan notes → tetap valid, notes opsional
- Jika hari sudah lewat dan belum ada bukti → status "Terlewat", streak workout untuk hari itu tidak dihitung
- Foto bukti wajib ada untuk menyelesaikan workout (tidak bisa klik "selesai" tanpa upload foto)

---

### FR-13 — Streak System

**Deskripsi:** Sistem pelacak konsistensi harian yang terpisah antara masak dan workout.

#### Streak Masak
- Dihitung jika user menandai resep sebagai "sudah dimasak" dengan resep yang berbeda dari hari sebelumnya
- "Berbeda" = resep ID berbeda (Opsi A)
- Streak bertambah 1 per hari jika syarat terpenuhi
- Streak reset setiap awal minggu baru (Senin)
- Tampil sebagai counter 🔥 di halaman home

#### Streak Workout
- Dihitung jika user upload foto bukti workout pada hari tersebut
- Streak bertambah 1 per hari
- Streak putus jika tidak ada bukti workout di hari sebelumnya (tidak ada grace period)
- Streak reset setiap awal minggu baru (Senin)
- Tampil sebagai counter 💪 di halaman home

**Acceptance Criteria:**
- Kedua streak tampil prominently di dashboard home
- Streak hari ini ditampilkan beda visual dari hari yang sudah lewat
- Riwayat streak mingguan bisa dilihat

**Edge Cases:**
- Timezone menggunakan WIB (UTC+7) sebagai default
- Hari yang sudah lewat tidak bisa di-update untuk keperluan streak

---

### FR-14 — Weekly Reward

**Deskripsi:** Reward diberikan saat streak mencapai target mingguan penuh.

**Acceptance Criteria:**
- Reward trigger: streak masak 7 hari dalam seminggu ATAU streak workout sesuai target mingguan yang di-set user
- Saat reward trigger: tampil animasi confetti + badge achievement + pesan motivasi dari Cloudflare AI
- Pesan motivasi di-generate oleh AI berdasarkan data: jumlah hari masak, tipe workout, streak count
- Badge tersimpan di koleksi badge user (halaman "Pencapaianku")
- Admin bisa konfigurasi badge baru dari panel admin (nama badge, deskripsi, ikon/emoji, kondisi trigger)

**Edge Cases:**
- Jika Cloudflare AI tidak tersedia → fallback ke pesan motivasi statis dari pool quotes
- Reward hanya diberikan sekali per periode minggu (tidak bisa double reward)
- Badge yang sama tidak diberikan dua kali

---

### FR-15 — Dashboard Home

**Deskripsi:** Halaman utama yang menjadi pusat aktivitas harian user.

**Acceptance Criteria:**
- Section "Hari Ini": tampil resep per slot makan hari ini + status (belum/sudah dimasak)
- Section "Workout Hari Ini": tampil workout yang dijadwalkan + tombol upload bukti
- Section "Streak": counter streak masak 🔥 dan workout 💪 minggu ini
- Section "Quotes": satu quotes motivasi harian (rotate dari pool 30–50 quotes berdasarkan tanggal)
- Catatan harian: field kecil untuk notes singkat hari ini
- Tombol shortcut ke: Library Resep, Meal Planner, Stok Bahan, Shopping List
- Greeting personal: "Selamat pagi, [nama]! 👋"

**Edge Cases:**
- Jika meal plan hari ini kosong → tampil CTA "Belum ada menu hari ini, mau assign sekarang?"
- Jika workout hari ini belum dijadwalkan → tampil CTA "Mau olahraga apa hari ini?"

---

### FR-16 — Weekly Summary

**Deskripsi:** Ringkasan mingguan yang di-generate setiap akhir minggu (Minggu malam).

**Acceptance Criteria:**
- Otomatis muncul sebagai modal/notifikasi saat user buka app di hari Minggu atau Senin pagi
- Konten: jumlah resep berbeda yang dimasak, hari workout, streak akhir, estimasi total pengeluaran masak
- Pesan motivasi personal di-generate oleh Cloudflare AI berdasarkan data mingguan
- Visual: card yang ceria dengan mini bar chart pengeluaran per hari
- User bisa dismiss atau simpan ke history

**Edge Cases:**
- Jika data minggu kosong (user tidak aktif) → tidak tampil weekly summary
- Jika Cloudflare AI gagal → fallback ke pesan statis

---

### FR-17 — Share Menu

**Deskripsi:** Generate gambar dari meal plan harian atau mingguan untuk di-share ke media sosial.

**Acceptance Criteria:**
- Tombol "Share" tersedia di halaman meal planner (daily & weekly view)
- User pilih: share hari ini atau share minggu ini
- Sistem generate gambar menggunakan `html-to-image` dari React component
- Template desain: background warna-warni, font besar, nama resep per slot, emoji kategori, watermark "HarianKu" kecil di bawah
- User pilih format sebelum generate: **9:16 (IG Story, 1080x1920)** atau **1:1 (IG Feed, 1080x1080)**
- Preview gambar menyesuaikan format yang dipilih secara real-time
- User bisa download gambar sebagai PNG

**Edge Cases:**
- Jika meal plan kosong → tidak bisa generate, tampil pesan "Isi meal plan dulu"
- Slot yang kosong di tampilan gambar → ditampilkan sebagai "Belum diisi" dengan styling yang tetap ceria

---

### FR-18 — History Masak

**Deskripsi:** Halaman atau section yang menampilkan log semua resep yang sudah pernah dimasak user, dikelompokkan per bulan.

**Acceptance Criteria:**
- Menampilkan daftar resep yang sudah ditandai "sudah dimasak", diurutkan dari terbaru
- Dikelompokkan per bulan (misal: "Juni 2025", "Mei 2025")
- Setiap item tampil: foto resep, nama resep, tanggal dimasak, slot makan (sarapan/siang/malam)
- User bisa tap item untuk lihat detail resep
- Filter by bulan tersedia
- Data disimpan selamanya (tidak ada expiry)

**Edge Cases:**
- Jika belum pernah masak → empty state ceria dengan CTA "Yuk mulai masak!"
- Jika resep asli sudah dihapus dari library → history tetap tampil dengan info "Resep sudah dihapus" tapi nama dan tanggal masih ada

---

### FR-19 — History Workout

**Deskripsi:** Halaman yang menampilkan log semua aktivitas workout yang sudah dilakukan user, dikelompokkan per bulan.

**Acceptance Criteria:**
- Menampilkan daftar workout yang sudah selesai (is_completed = true), diurutkan dari terbaru
- Dikelompokkan per bulan
- Setiap item tampil: tipe workout (Jogging/Gym/Rumah), tanggal, thumbnail foto bukti, notes (jika ada)
- User bisa tap item untuk lihat foto bukti full-size
- Summary per bulan: total hari workout, tipe workout terbanyak
- Data disimpan selamanya

**Edge Cases:**
- Jika belum pernah workout → empty state dengan CTA "Catat workout pertamamu!"
- Hari yang terlewat (streak putus) tidak tampil di history, hanya yang completed

---

### FR-20 — Halaman Pencapaian (Badge Collection)

**Deskripsi:** Halaman yang menampilkan semua badge yang sudah dikumpulkan user dan badge yang belum terbuka.

**Acceptance Criteria:**
- Grid tampilan badge: earned (berwarna + nama) dan locked (grayscale + "???" atau hint kondisi)
- Setiap badge earned tampil: ikon, nama badge, deskripsi, tanggal didapat
- Badge locked tampil hint kondisi trigger (misal: "Selesaikan 7 hari streak masak")
- Total badge earned ditampilkan di bagian atas (misal: "5 dari 12 badge")
- Riwayat streak mingguan tersedia di halaman ini (per minggu: cooking streak X/7, workout streak X/target)
- Animasi entrance untuk badge baru yang baru saja didapat

**Edge Cases:**
- Jika belum punya badge → tampil semua badge dalam kondisi locked dengan hint masing-masing
- Badge yang dihapus admin dari sistem → tidak tampil lagi, tapi badge yang sudah earned user tetap ada

---

### FR-21 — Laporan Pengeluaran

**Deskripsi:** Visualisasi estimasi pengeluaran masak user berdasarkan harga bahan yang diinput, ditampilkan di Weekly Summary dan halaman Dapur.

**Acceptance Criteria:**
- Estimasi biaya per resep dihitung otomatis dari: jumlah bahan × harga per satuan bahan di stok
- Estimasi biaya per hari = total biaya semua resep yang dimasak hari itu
- Di Weekly Summary: tampil total pengeluaran minggu ini, rata-rata per hari, resep termahal & termurah, mini bar chart per hari
- Di halaman Dapur (tab Laporan): tampil ringkasan bulanan — total per minggu dalam bulan berjalan, grafik sederhana
- Semua tampilan dalam format card visual yang ceria, bukan tabel
- Jika harga bahan tidak diinput → estimasi tidak tampil untuk bahan tersebut, tampil info "Lengkapi harga bahan untuk estimasi lebih akurat"

**Edge Cases:**
- Jika user belum input harga apapun → section laporan tampil dengan empty state + CTA "Tambah harga bahan di Stok"
- Jika resep sudah dimasak tapi harga bahan berubah setelahnya → gunakan harga saat ini (harga statis, bukan historis)

---

### FR-22 — Admin Panel

**Deskripsi:** Halaman terpisah untuk admin mengelola konten dan konfigurasi app.

**Acceptance Criteria:**
- Akses admin hanya untuk user dengan role `admin` di database
- URL terpisah: `/admin`
- UI style: dashboard, lebih formal dari user UI
- Fitur: kelola reward & badge (CRUD), kelola resep starter (CRUD), lihat statistik user (jumlah user, rata-rata streak, resep terpopuler)
- Admin bisa set kondisi trigger untuk badge baru

**Edge Cases:**
- Akses `/admin` oleh non-admin → redirect ke dashboard user
- Hapus reward yang sudah pernah diberikan ke user → data badge user tetap ada (soft reference)

---

## 6. Non-Functional Requirements

### Performance
- First contentful paint < 1.5 detik pada koneksi 4G
- Halaman home dan meal planner load < 2 detik
- Upload foto ke Cloudinary < 5 detik untuk ukuran foto mobile (< 5MB)
- Shopping list calculation < 1 detik

### Security
- Semua route selain landing page wajib autentikasi
- Admin route wajib role check server-side
- Data user diisolasi per user ID — tidak ada akses ke data user lain
- Environment variables tidak boleh expose di client-side (kecuali yang public)
- Upload file hanya accept format: jpg, jpeg, png, webp

### Responsiveness
- Mobile-first: optimal di layar 375px – 430px (iPhone SE – iPhone Pro Max)
- Tablet: fungsional di 768px
- Desktop: tetap usable tapi bukan prioritas utama desain
- Touch-friendly: semua tap target minimal 44x44px

### Browser Support
- Chrome (Android & iOS) — primary
- Safari (iOS) — primary
- Firefox — secondary
- Samsung Internet — secondary

---

## 7. Tech Spec Summary

### Stack
| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Storage | Cloudinary (foto resep & workout) |
| AI | Cloudflare Workers AI |
| Image Generate | html-to-image (npm) |
| Search | Fuse.js (client-side fuzzy search) |
| Animation | Framer Motion (micro-animation & confetti) |
| Bottom Sheet | vaul |
| Toast | sonner |
| Deploy | Vercel |

### Struktur Folder
```
/app
  /(auth)
    /login
  /(main)
    /dashboard         → Home
    /resep             → Library Resep
    /resep/[id]        → Detail Resep
    /resep/baru        → Tambah Resep
    /meal-planner      → Meal Planner Mingguan
    /meal-planner/template → Template Manager
    /kalender          → Monthly View
    /stok              → Stok Bahan
    /belanja           → Shopping List
    /workout           → Modul Workout
    /pencapaian        → Badge Collection & Streak History
    /history/masak     → History Resep per Bulan
    /history/workout   → History Workout per Bulan
    /dapur             → Stok + Shopping List + Laporan Pengeluaran
  /admin
    /dashboard
    /reward
    /resep-starter
    /statistik
  /api
    /auth
    /resep
    /meal-plan
    /stok
    /workout
    /streak
    /reward
    /ai/summary        → Cloudflare AI endpoint
    /share/generate    → html-to-image endpoint
/components
  /ui                  → Komponen generik (Button, Card, Modal, dll)
  /resep               → Komponen spesifik resep
  /meal-planner
  /workout
  /streak
  /share
/lib
  /supabase            → Client & server Supabase
  /cloudinary
  /cloudflare-ai
  /utils
/hooks
/types
```

### API Endpoints Utama

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/resep` | List semua resep user |
| POST | `/api/resep` | Tambah resep baru |
| PUT | `/api/resep/[id]` | Update resep |
| DELETE | `/api/resep/[id]` | Hapus resep |
| GET | `/api/meal-plan?week=YYYY-WW` | Get meal plan minggu tertentu |
| POST | `/api/meal-plan/slot` | Assign resep ke slot |
| DELETE | `/api/meal-plan/slot/[id]` | Hapus resep dari slot |
| GET | `/api/meal-plan/template` | List template user |
| POST | `/api/meal-plan/template` | Simpan template baru |
| POST | `/api/meal-plan/template/[id]/apply` | Apply template ke minggu |
| GET | `/api/stok` | List stok bahan user |
| POST | `/api/stok` | Tambah bahan stok |
| PUT | `/api/stok/[id]` | Update stok |
| POST | `/api/stok/deduct` | Kurangi stok setelah masak |
| GET | `/api/belanja?week=YYYY-WW` | Generate shopping list |
| GET | `/api/workout?month=YYYY-MM` | List workout history |
| POST | `/api/workout` | Tambah/update workout harian |
| GET | `/api/streak` | Get streak data user |
| POST | `/api/streak/check` | Trigger check & update streak |
| GET | `/api/reward` | List badge user |
| POST | `/api/ai/summary` | Generate weekly summary via Cloudflare AI |
| POST | `/api/share/generate` | Generate share image |
| GET | `/api/history/masak?month=YYYY-MM` | List history masak per bulan |
| GET | `/api/history/workout?month=YYYY-MM` | List history workout per bulan |
| GET | `/api/pencapaian` | List badge collection user |
| GET | `/api/laporan?period=weekly&week=YYYY-WW` | Laporan pengeluaran mingguan |
| GET | `/api/laporan?period=monthly&month=YYYY-MM` | Laporan pengeluaran bulanan |

### Database Schema

```sql
-- Users (managed by Supabase Auth, extended)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  name text,
  goal text, -- 'makan_sehat' | 'aktif_olahraga' | 'keduanya'
  onboarding_completed boolean DEFAULT false,
  workout_target_weekly int DEFAULT 3,
  auto_repeat_meal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Kategori Resep
categories (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  name text NOT NULL,
  color text NOT NULL, -- hex color
  created_at timestamptz DEFAULT now()
)

-- Resep
recipes (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories,
  tags text[], -- array of tags
  estimated_time_minutes int, -- nullable (opsional)
  servings int DEFAULT 1,
  steps text[],
  is_favorite boolean DEFAULT false,
  is_starter boolean DEFAULT false, -- resep starter dari admin
  rating int, -- 1-5, nullable (diisi setelah dimasak)
  rating_notes text,
  created_at timestamptz DEFAULT now()
)

-- Foto Resep
recipe_photos (
  id uuid PRIMARY KEY,
  recipe_id uuid REFERENCES recipes,
  url text NOT NULL,
  type text NOT NULL, -- 'reference' | 'result'
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Bahan Resep
recipe_ingredients (
  id uuid PRIMARY KEY,
  recipe_id uuid REFERENCES recipes,
  name text NOT NULL,
  amount numeric NOT NULL,
  unit text NOT NULL,
  price_per_unit numeric -- nullable
)

-- Meal Plan
meal_plans (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  week_start date NOT NULL, -- selalu Senin
  notes jsonb, -- { "monday": "catatan", "tuesday": "" }
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
)

-- Meal Plan Slots
meal_plan_slots (
  id uuid PRIMARY KEY,
  meal_plan_id uuid REFERENCES meal_plans,
  day_of_week int NOT NULL, -- 1=Senin, 7=Minggu
  slot text NOT NULL, -- 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  recipe_id uuid REFERENCES recipes,
  is_cooked boolean DEFAULT false,
  cooked_at timestamptz
)

-- Cooking History Log (terpisah dari meal_plan_slots untuk tracking yang lebih bersih)
cooking_history (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  recipe_id uuid REFERENCES recipes,
  recipe_name text NOT NULL, -- snapshot nama resep (antisipasi resep dihapus)
  recipe_photo_url text,     -- snapshot foto resep
  slot text NOT NULL,        -- 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  cooked_at date NOT NULL,
  estimated_cost numeric,    -- snapshot estimasi biaya saat dimasak
  created_at timestamptz DEFAULT now()
)

-- Template Meal Plan
meal_plan_templates (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  name text NOT NULL,
  slots jsonb, -- snapshot of slots
  created_at timestamptz DEFAULT now()
)

-- Stok Bahan
stock_items (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  name text NOT NULL,
  amount numeric NOT NULL,
  unit text NOT NULL,
  price_per_unit numeric, -- nullable
  threshold_amount numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
)

-- Workout Log
workout_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  date date NOT NULL,
  type text NOT NULL, -- 'jogging' | 'gym' | 'rumah'
  proof_photo_url text,
  notes text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
)

-- Streak
streaks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  week_start date NOT NULL,
  cooking_streak int DEFAULT 0,
  workout_streak int DEFAULT 0,
  cooking_days jsonb, -- { "1": recipe_id, "2": recipe_id } hari yang berhasil
  workout_days jsonb, -- { "1": true, "3": true }
  UNIQUE(user_id, week_start)
)

-- Badge & Reward
badges (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text, -- emoji atau URL ikon
  trigger_type text, -- 'cooking_streak_7' | 'workout_target' | dll
  trigger_value int,
  created_by uuid REFERENCES profiles -- admin
)

user_badges (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  badge_id uuid REFERENCES badges,
  earned_at timestamptz DEFAULT now()
)
```

---

## 8. UI & Wireframe ASCII

### Design System

#### 🎨 Color Palette

| Peran | Nama | Hex | Penggunaan |
|-------|------|-----|------------|
| **Primary** | Pink Cerah | `#FF6B9D` | CTA button, active tab, streak counter, highlight utama |
| **Primary Dark** | Pink Tua | `#E8537A` | Hover state, pressed button |
| **Primary Light** | Pink Muda | `#FFD6E7` | Background chip aktif, badge background, subtle highlight |
| **Secondary** | Kuning Ceria | `#FFD93D` | Reward badge, quotes card, aksen dekoratif |
| **Accent** | Hijau Mint | `#6BCB77` | Status "sudah dimasak", stok cukup, streak workout |
| **Warning** | Oranye | `#FF9A3C` | Alert stok hampir habis, peringatan |
| **Danger** | Merah Muda | `#FF6B6B` | Stok habis, error state |
| **Background** | Putih Hangat | `#FFF8FB` | Background halaman utama (sedikit pink tint) |
| **Surface** | Putih | `#FFFFFF` | Background card, modal, bottom sheet |
| **Surface Alt** | Abu Pink | `#F9F0F4` | Background section, input field |
| **Text Primary** | Abu Gelap | `#2D2D2D` | Heading, body text utama |
| **Text Secondary** | Abu Medium | `#6B6B6B` | Subtext, placeholder, label |
| **Text Disabled** | Abu Muda | `#BBBBBB` | Disabled state |
| **Border** | Abu Pink Muda | `#EFE0E8` | Border card, divider |

---

#### 🔤 Typography

| Level | Font | Size | Weight | Penggunaan |
|-------|------|------|--------|------------|
| Display | Plus Jakarta Sans | 28px | 700 Bold | Judul halaman besar (landing, onboarding) |
| H1 | Plus Jakarta Sans | 22px | 700 Bold | Judul halaman dalam app |
| H2 | Plus Jakarta Sans | 18px | 600 SemiBold | Sub-judul section |
| H3 | Plus Jakarta Sans | 16px | 600 SemiBold | Judul card, nama resep |
| Body | Plus Jakarta Sans | 14px | 400 Regular | Body text, deskripsi |
| Body Small | Plus Jakarta Sans | 12px | 400 Regular | Label, metadata, timestamp |
| Caption | Plus Jakarta Sans | 11px | 400 Regular | Watermark, hint text |
| Button | Plus Jakarta Sans | 14px | 600 SemiBold | Semua label button |

**Aturan typography:**
- Line height: 1.5x font size untuk body, 1.2x untuk heading
- Letter spacing: heading `-0.3px`, body `0px`
- Hindari text lebih dari 3 ukuran berbeda dalam satu halaman

---

#### 📐 Spacing & Layout

Gunakan skala 4px sebagai base unit:

| Token | Value | Penggunaan |
|-------|-------|------------|
| `space-1` | 4px | Gap antar elemen inline kecil |
| `space-2` | 8px | Padding dalam chip, gap ikon + label |
| `space-3` | 12px | Gap antar item list |
| `space-4` | 16px | Padding card, margin section |
| `space-5` | 20px | Padding horizontal halaman |
| `space-6` | 24px | Gap antar section besar |
| `space-8` | 32px | Margin top section utama |

**Layout:**
- Padding horizontal halaman: `20px` kiri & kanan
- Max content width: `430px` (mobile-first, centered di desktop)
- Bottom navigation height: `64px` + safe area inset
- Top header height: `56px`

---

#### 🔘 Border Radius

| Token | Value | Penggunaan |
|-------|-------|------------|
| `radius-sm` | 8px | Input field, chip kecil |
| `radius-md` | 12px | Card kecil, toast |
| `radius-lg` | 16px | Card utama, modal |
| `radius-xl` | 20px | Bottom sheet, card hero |
| `radius-full` | 9999px | Button CTA, avatar, badge |

---

#### 🧩 Komponen UI

**Button:**
```
Primary   → background: Pink (#FF6B9D), text: white, radius: full
           Ukuran: height 48px, padding horizontal 24px
Secondary → background: Pink Light (#FFD6E7), text: Pink (#FF6B9D)
Ghost     → background: transparent, border: 1.5px Pink, text: Pink
Danger    → background: #FF6B6B, text: white
Disabled  → background: #BBBBBB, text: white, opacity: 0.6
```

**Card:**
```
Background: white (#FFFFFF)
Border: 1px solid #EFE0E8
Border radius: 16px
Shadow: 0 2px 12px rgba(255, 107, 157, 0.08)  ← pink-tinted shadow
Padding: 16px
```

**Input Field:**
```
Background: #F9F0F4
Border: 1.5px solid #EFE0E8
Border radius: 8px
Focus border: 1.5px solid #FF6B9D
Height: 48px
Padding: 12px 16px
Tidak ada label melayang (floating label) — gunakan placeholder + label di atas
```

**Chip / Filter Tag:**
```
Default  → background: #F9F0F4, text: #6B6B6B, border: 1px #EFE0E8
Active   → background: #FFD6E7, text: #FF6B9D, border: 1px #FF6B9D
Radius: full, height: 32px, padding: 8px 14px
```

**Bottom Sheet → Library: `vaul`**
```
Install: npm install vaul
Gesture swipe-to-dismiss built-in
Accessible by default (focus trap, aria)
Max height: 85vh, scroll internal otomatis
Backdrop: rgba(0,0,0,0.4)
Kustomisasi warna handle & background via className Tailwind
```

**Toast / Snackbar → Library: `sonner`**
```
Install: npm install sonner
Posisi: bottom center, di atas bottom nav
Auto dismiss: 3 detik (default)
Variant: sonner.success(), sonner.warning(), sonner.error()
Kustomisasi warna via toastOptions di <Toaster /> provider
Success → #6BCB77, Warning → #FF9A3C, Error → #FF6B6B
```

**Badge / Achievement:**
```
Shape: circle 64px x 64px
Background: gradient Pink Light ke Pink (#FFD6E7 → #FF6B9D)
Icon: emoji 28px centered
Shadow: 0 4px 16px rgba(255, 107, 157, 0.3)
Locked state: grayscale + opacity 0.4
```

**Streak Counter:**
```
🔥 Masak  → card kecil, background: linear-gradient(#FFD93D, #FF9A3C)
💪 Workout → card kecil, background: linear-gradient(#6BCB77, #3AAD56)
Angka: font 28px bold, warna white
Label: font 11px, warna white 80%
```

---

#### 🎭 Ilustrasi & Ikon

**Ikon:**
- Library: Lucide Icons (konsisten, clean, rounded style)
- Size: 20px untuk navigasi, 16px untuk inline, 24px untuk CTA besar
- Warna default: `#6B6B6B`, aktif: `#FF6B9D`

**Ilustrasi:**
- Style: flat illustration dengan warna dari palette app
- Digunakan di: empty state, onboarding, landing page, reward modal
- Format: SVG (scalable, tidak blur di layar retina)
- Karakter ilustrasi: perempuan/laki-laki memasak atau olahraga, gaya kartun ramah

**Emoji sebagai UI element:**
- Digunakan bebas untuk menambah keceriaan: slot makan (🌅☀️🌙), kategori resep, tipe workout
- Ukuran: 20px inline, 32px untuk card besar

---

#### ✨ Motion & Animasi

| Elemen | Animasi | Duration | Easing |
|--------|---------|----------|--------|
| Button tap | Scale 0.97 → 1.0 | 100ms | ease-out |
| Card muncul | Fade + slide up 8px | 200ms | ease-out |
| Bottom sheet buka | Slide up | 300ms | ease-out |
| Bottom sheet tutup | Slide down | 250ms | ease-in |
| Toast muncul | Fade + slide up | 200ms | ease-out |
| Streak +1 | Bounce scale 1.0 → 1.3 → 1.0 | 400ms | spring |
| Checkbox centang | Scale + checkmark draw | 250ms | ease-out |
| Tab switch | Fade cross | 150ms | ease |
| Confetti reward | Particle burst full screen | 2000ms | physics |
| Page transition | Fade | 150ms | ease |

**Prinsip animasi:**
- Semua animasi harus terasa **snappy, bukan lambat**
- Jangan animasi elemen yang tidak berinteraksi langsung dengan user
- Gunakan `prefers-reduced-motion` media query — matikan animasi jika user setting aksesibilitas aktif

---

#### 🗺️ Navigation Structure

```
Bottom Navigation (5 tab):
├── 🏠 Home       → /dashboard
├── 🍽️ Masak      → /meal-planner
├── 🏃 Workout    → /workout
├── 📦 Dapur      → /stok (Stok + Shopping List)
└── 👤 Profil     → /profil (Badge, Settings, Logout)

Top Header (per halaman):
├── Kiri: tombol back (jika sub-halaman) atau greeting
├── Tengah: judul halaman
└── Kanan: aksi kontekstual (misal: [+ Baru], [Share], [Filter])
```

---

#### 📱 UX Principles — Minim Form

Ini adalah prinsip desain inti HarianKu. Setiap fitur harus didesain dengan pendekatan berikut:

**1. Tap, bukan ketik**
Gunakan bottom sheet picker, toggle, chip selector, dan star rating daripada input text jika memungkinkan.
Contoh: pilih kategori resep = tap chip, bukan ketik nama kategori.

**2. Progressive disclosure**
Jangan tampilkan semua field sekaligus. Tampilkan yang wajib dulu, sisanya di-collapse atau opsional jelas.
Contoh: form tambah resep — nama + foto dulu, bahan + langkah bisa expand setelahnya.

**3. Smart default**
Isi nilai default yang masuk akal agar user tidak merasa form kosong.
Contoh: estimasi waktu default 30 menit, porsi default 2 orang.

**4. Inline action**
Aksi yang sering dilakukan harus bisa dilakukan langsung dari list/card tanpa masuk halaman baru.
Contoh: tandai resep "sudah dimasak" langsung dari card di home, bukan harus buka detail resep.

**5. Empty state yang helpful**
Setiap halaman yang bisa kosong harus punya empty state dengan ilustrasi ceria + CTA yang jelas.
Bukan hanya teks "Belum ada data."

**6. Feedback instan**
Setiap aksi user harus dapat respons visual dalam < 100ms.
Gunakan optimistic UI — tampilkan hasil aksi sebelum server konfirmasi, rollback jika gagal.

**7. Gesture-friendly**
- Swipe kiri/kanan untuk navigasi minggu di meal planner
- Swipe down untuk tutup bottom sheet
- Long press untuk aksi sekunder (misal: hapus slot resep)
- Pull to refresh di halaman list

---

### Halaman: Landing Page
```
┌─────────────────────────────┐
│  🍳 HarianKu          [Login]│
├─────────────────────────────┤
│                             │
│   [Ilustrasi ceria dapur]   │
│                             │
│  Makan Teratur,             │
│  Gerak Rutin,               │
│  Satu App! 🎉               │
│                             │
│  Rencanakan menu mingguanmu,│
│  lacak workout, dan pantau  │
│  stok dapur — semua di sini │
│                             │
│  [Mulai Sekarang →]         │
│                             │
├─────────────────────────────┤
│  ✨ Fitur Unggulan          │
│                             │
│  🍽️ Meal Planner            │
│  Jadwalkan menu Senin–Minggu│
│                             │
│  💪 Workout Tracker         │
│  Catat olahraga + streak    │
│                             │
│  🛒 Stok & Belanja          │
│  Auto-generate daftar belanja│
└─────────────────────────────┘
```

### Halaman: Dashboard Home
```
┌─────────────────────────────┐
│  Selamat pagi, Rara! 👋     │
│  Senin, 10 Juni 2025        │
├─────────────────────────────┤
│  🔥 Streak Masak   3/7 hari │
│  💪 Streak Workout 2/7 hari │
│  ████████░░░░░░  Progress   │
├─────────────────────────────┤
│  🍽️ Menu Hari Ini           │
│  ┌──────────────────────┐   │
│  │ 🌅 Sarapan           │   │
│  │ Oatmeal Pisang  15m  │   │
│  │ [✓ Sudah Dimasak]    │   │
│  ├──────────────────────┤   │
│  │ ☀️ Makan Siang        │   │
│  │ Ayam Goreng     30m  │   │
│  │ [Tandai Dimasak]     │   │
│  ├──────────────────────┤   │
│  │ 🌙 Makan Malam       │   │
│  │ Sayur Asem      20m  │   │
│  │ [Tandai Dimasak]     │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  💪 Workout Hari Ini        │
│  Jogging pagi — [Upload Bukti]│
├─────────────────────────────┤
│  💬 "Masak sendiri itu     │
│  investasi terbaik untuk   │
│  kesehatanmu." ☀️           │
├─────────────────────────────┤
│  📝 Catatan hari ini...     │
├─────────────────────────────┤
│ [Resep] [Planner] [Stok] [Belanja]│
└─────────────────────────────┘
```

### Halaman: Meal Planner Mingguan
```
┌─────────────────────────────┐
│  ← Minggu Ini  Jun 9–15  → │
│  [Template] [Auto-repeat●] │
├──────┬──────────────────────┤
│ SEN  │ ☀️ Ayam Goreng        │
│  10  │ 🌙 Sayur Asem         │
│      │ [+ Tambah]           │
├──────┼──────────────────────┤
│ SEL  │ 🌅 Oatmeal           │
│  11  │ ☀️ Nasi Goreng        │
│      │ 🌙 Sop Ayam           │
├──────┼──────────────────────┤
│ RAB  │ [+ Tambah menu]      │
│  12  │                      │
├──────┼──────────────────────┤
│ ...  │ ...                  │
├─────────────────────────────┤
│         [Share Menu 📸]     │
└─────────────────────────────┘
```

### Halaman: Library Resep
```
┌─────────────────────────────┐
│  🍳 Resepku          [+ Baru]│
├─────────────────────────────┤
│  🔍 Cari resep...           │
│  [Favorit] [Cepat] [Diet] ↓ │
├─────────────────────────────┤
│  ┌──────────┐ ┌──────────┐  │
│  │ [foto]   │ │ [foto]   │  │
│  │Ayam Goreng│ │Oatmeal  │  │
│  │⏱ 30m ⭐4│ │⏱ 10m ⭐5│  │
│  │🟠 Berat  │ │🟡 Sarapan│  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ [foto]   │ │    +     │  │
│  │Sayur Asem│ │  Tambah  │  │
│  │⏱ 20m ⭐3│ │  Resep   │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

### Halaman: Stok Bahan
```
┌─────────────────────────────┐
│  📦 Stok Bahan       [+ Baru]│
├─────────────────────────────┤
│  ⚠️ Hampir Habis (2)        │
│  ┌──────────────────────┐   │
│  │ 🔴 Bawang Merah      │   │
│  │ Sisa: 50g / min 100g │   │
│  │ [Update Stok]        │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  ✅ Stok Cukup (8)          │
│  ┌──────────────────────┐   │
│  │ ✅ Ayam              │   │
│  │ Sisa: 800g           │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ ✅ Telur             │   │
│  │ Sisa: 8 butir        │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

---

## 9. User Flow Utama

### Flow 1 — First Time User
```
Landing Page
→ Tap "Mulai Sekarang"
→ Google OAuth Login
→ Onboarding: Pilih Goal
→ 5 Resep Starter Muncul di Library
→ Redirect ke Dashboard Home
→ Home menampilkan CTA "Buat Meal Plan Minggu Ini"
```

### Flow 2 — Assign Resep ke Meal Plan
```
Dashboard Home / Meal Planner
→ Tap slot kosong (misal: Senin - Makan Siang)
→ Drawer muncul dari bawah
→ Search / filter resep
→ Tap resep yang dipilih
→ Slot terisi, drawer tutup
→ Warna kategori resep muncul di slot
```

### Flow 3 — Tandai Masak + Update Stok
```
Dashboard Home
→ Tap "Tandai Dimasak" pada resep slot
→ Konfirmasi modal: "Selesai masak [nama resep]?"
→ User tap "Ya, sudah dimasak"
→ Stok bahan otomatis berkurang
→ Jika ada bahan di bawah threshold → muncul toast warning
→ Streak masak di-check: resep berbeda dari kemarin?
→ Jika ya: streak +1, animasi kecil di counter
```

### Flow 4 — Weekly Reward
```
[Background check setiap hari Minggu malam]
→ Sistem check: apakah streak masak 7/7 atau workout target tercapai?
→ Jika ya: saat user buka app Senin pagi
→ Muncul modal full-screen confetti 🎉
→ Badge baru tampil dengan animasi
→ Pesan motivasi dari Cloudflare AI
→ User tap "Keren!" → modal tutup
→ Badge tersimpan di halaman Pencapaianku
```

### Flow 5 — Generate Share Image
```
Meal Planner → Tap "Share Menu 📸"
→ Pilih: Hari Ini / Minggu Ini
→ Preview template gambar playful
→ Tap "Download" → simpan ke galeri HP
```

### Flow 6 — Lihat History Masak Bulanan
```
Bottom Nav → tab Masak → tap "History"
→ Halaman History Masak terbuka
→ Default tampil bulan berjalan
→ List resep yang sudah dimasak, dikelompokkan per tanggal
→ Tap filter bulan → pilih bulan lain
→ Tap item → detail resep terbuka
```

### Flow 7 — Cek Laporan Pengeluaran
```
Bottom Nav → tab Dapur → tap "Laporan"
→ Section laporan terbuka
→ Tampil total pengeluaran minggu ini + mini bar chart
→ Scroll bawah → tampil ringkasan per minggu bulan ini
→ Tap minggu tertentu → expand detail resep + biaya
```

### Flow 8 — Lihat Koleksi Badge
```
Bottom Nav → tab Profil → tap "Pencapaianku"
→ Grid badge terbuka
→ Badge earned: berwarna + nama + tanggal dapat
→ Badge locked: grayscale + hint kondisi
→ Tap badge apapun → bottom sheet detail badge muncul
```

---

## 10. Open Questions

> ✅ Semua open questions sudah terjawab dan di-lock.

| # | Pertanyaan | Keputusan Final |
|---|-----------|----------------|
| OQ-01 | Apakah pesan motivasi AI di weekly summary di-cache atau di-generate fresh setiap minggu? | ✅ **Di-generate fresh setiap minggu** — tidak di-cache |
| OQ-02 | Apakah catatan harian di meal planner bisa dilihat di monthly view? | ✅ **Ya** — tap hari di monthly view → muncul bottom sheet mobile-friendly berisi catatan + resep hari itu |
| OQ-03 | Bagaimana handle timezone untuk user di luar WIB? | ✅ **Default WIB (UTC+7)** untuk semua user, tidak ada opsi ganti timezone di MVP |
| OQ-04 | Apakah admin bisa tambah resep starter langsung dari panel admin? | ✅ **Ya** — admin bisa CRUD resep starter dari panel admin |
| OQ-05 | Format gambar share: support IG Story (9:16) dan Feed (1:1) sekaligus, atau pilih salah satu dulu? | ✅ **Support keduanya** — user pilih format (9:16 Story atau 1:1 Feed) saat akan generate gambar |
| OQ-06 | Apakah user bisa custom nama slot makan (misal: ganti "Camilan" jadi "Brunch")? | ✅ **Tidak** — nama slot fixed: Sarapan / Makan Siang / Makan Malam / Camilan |
| OQ-07 | Berapa lama history workout dan masak disimpan? | ✅ **Disimpan selamanya** — tidak ada reset atau expiry |

---

*PRD ini dibuat berdasarkan sesi brainstorming HarianKu v1.0*
*Siap digunakan sebagai panduan coding — ketik `/tasklist` untuk generate tasklist.*
