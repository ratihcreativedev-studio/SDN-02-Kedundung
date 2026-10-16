# Audit sebelum deploy — 17 Oktober 2026

## Hasil

- `pnpm lint`: lulus, tanpa error atau warning ESLint.
- `pnpm exec tsc --noEmit` dan `pnpm build`: lulus; 30 halaman berhasil dihasilkan.
- `pnpm exec prisma validate`: skema valid.
- `pnpm test`: 74 pengujian lulus. Satu pengujian integrasi dilewati secara default karena harus dijalankan dengan akses database secara eksplisit.
- `pnpm test:integration`: 9 skenario dalam 1 pengujian induk lulus (10 hasil di Node test runner). Memakai database sungguhan dan data sintetis dalam transaksi rollback.
- Chrome headless: 11 rute pada lebar desktop 1440px dan mobile 390px, total 22 pemeriksaan lulus. Tidak ditemukan exception JavaScript, gambar rusak, atau overflow horizontal pada halaman yang diperiksa.
- Storage: PDF sintetis berhasil diunggah dan diunduh, isinya cocok, kemudian dihapus.
- Penelusuran import dari entry point Next.js: tidak tersisa modul TypeScript yang tidak terjangkau.
- `git diff --check`: lulus.

## Perbaikan

- Absensi publik sebelumnya menampilkan data contoh bulanan. Sekarang membaca rekap semester dari database dan menyediakan filter kelas/semester.
- NISN wajib 10 digit dan tanggal lahir wajib tanggal kalender yang valid.
- Penggantian ijazah dan gambar prestasi menyimpan file baru serta URL database sebelum menghapus file lama. Kegagalan simpan database membersihkan file baru, bukan file lama.
- Upload dan hapus ijazah tidak dapat dijalankan bersamaan dari komponen yang sama.
- Perubahan siswa, kelas, ijazah, dan prestasi memperbarui halaman terkait.
- Statistik siswa publik menghitung siswa aktif tanpa memuat seluruh biodata siswa.
- Parameter pengurutan siswa divalidasi sebelum dikirim ke Prisma.
- Pengujian lama diperbarui untuk format rekap semester. Pengujian Excel lama yang sudah digantikan suite parser/action/integrasi dihapus.

## Pembersihan

20 file dihapus: 11 file fitur/rute Mapel, 3 komponen daftar nilai lama, filter bulanan lama, filter absensi contoh, tombol hapus siswa yang tidak dipakai, 2 berkas data contoh akademik, dan gambar maskot.

Query penghitung rekap yang tidak digunakan serta komponen/helper kartu dan konteks grafik tanpa pemakai juga dibersihkan. Tabel historis database, migrasi SQL, dan skrip pemeliharaan tetap disimpan.

## Cakupan pengujian

Pengujian otomatis mencakup otorisasi mutasi, login/session dengan dependency terisolasi, CRUD siswa/kelas/guru, CMS pengumuman/prestasi/profil, catatan siswa, validasi Excel, rekap lintas semester, notifikasi, dan kegagalan penggantian dokumen.

Pengujian database mencakup pencarian NISN/NIM dengan biodata lengkap serta upload semester baru, upload ulang, edit, dan hapus pada absensi dan nilai. Detail siswa admin/publik dirender pada sisi server. Semua data sintetis di-rollback dan diverifikasi tidak tersisa.

Rute browser: `/`, `/tentang-sekolah`, `/data-siswa`, `/prestasi`, `/gerakan-7kaih`, `/tata-tertib`, `/informasi`, `/absensi`, `/daftar-nilai`, `/login`, `/admin`. Interaksi meliputi perubahan navbar saat scroll, menu mobile, pencarian siswa tidak ditemukan, filter kelas 2 dan Ganjil/Genap, serta redirect admin ke login.

## Batas pemeriksaan

Login interaktif Google menggunakan akun admin sungguhan dan seluruh formulir admin melalui browser belum dijalankan. Alur otorisasi diuji secara terisolasi; mutasi semester diuji pada database nyata dengan identitas admin pengujian. Deploy online belum dilakukan. Hasil ini bukan jaminan bahwa seluruh konfigurasi hosting produksi identik dengan server lokal.

Sebelum rilis, pastikan environment produksi dan seluruh migrasi SQL sudah sesuai. Migrasi absensi semester sudah diterapkan pada database yang digunakan dalam sesi ini. Setelah deploy, lakukan smoke test login Google dan satu upload kecil dari akun admin asli.
