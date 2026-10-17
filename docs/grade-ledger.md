# Leger nilai

Menu admin Nilai terdiri dari UH/ASTS/ASAS dan Rapor (`/admin/nilai`), Mata Pelajaran (`/admin/nilai/mata-pelajaran`), dan Ekstrakurikuler (`/admin/nilai/ekstrakurikuler`).

Migrasi tambahan: `prisma/sql/20261017_grade_ledger.sql`. Jalankan pada database tujuan sebelum menjalankan aplikasi yang memakai schema baru, lalu jalankan `pnpm exec prisma generate`. Migrasi tidak mengubah tabel nilai lama.

- `student_reports` tetap menyimpan UH, ASTS, ASAS dan nilai rapor.
- `ledger_reports` menyimpan siswa, kelas saat impor, semester, sakit, izin, dan alpa.
- `ledger_subject_grades` menyimpan 11 nilai mapel (0–100 atau null); BI_ID dan BI_EN membedakan dua kolom BI sesuai keterangan Excel.
- `ledger_extracurricular_grades` menyimpan 8 kegiatan dengan predikat SB/B/C/K atau null.

Upload memakai format f_leger_Kelas 5.xlsx, termasuk header bertingkat dan judul tahun pelajaran/semester. NISN dicocokkan dengan siswa kelas terpilih. Semester file harus sesuai filter. File yang mengandung NISN asing, duplikat atau nilai tidak valid ditolak sebelum penyimpanan. Semua baris disimpan dalam satu transaksi.

Upload melalui Nilai Mata Pelajaran sekaligus menyimpan nilai mata pelajaran dan ekstrakurikuler dari file yang sama dalam satu transaksi. Upload hanya tersedia melalui Nilai Mata Pelajaran dan server menolak upload dengan kategori ekstrakurikuler. Menu Nilai Ekstrakurikuler menyediakan tautan menuju Nilai Mata Pelajaran dengan kelas dan semester yang sama; edit per siswa dan hapus rekap tetap tersedia. Pembaruan berlaku bagi siswa dan semester dalam file; siswa yang tidak tercantum dan semester lainnya tetap tersimpan. Sel kosong disimpan sebagai null, bukan nol. Ketidakhadiran diperbarui dalam leger, terpisah dari rekap absensi. Identitas siswa yang sudah ada tidak diubah oleh upload leger. File contoh dipakai untuk memverifikasi format, bukan otomatis mengimpor nilai siswa.

Verifikasi: `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, dan `pnpm exec prisma validate`.

Admin dapat mengedit nilai siswa pada rekap yang sudah tersedia: angka 0–100 untuk mata pelajaran dan pilihan SB/B/C/K untuk ekstrakurikuler. Nilai kosong disimpan sebagai null. Edit dibatasi oleh siswa, kelas tersimpan, semester dan kategori.

Tombol Hapus Rekap Nilai meminta konfirmasi dan hanya menghapus rincian kategori pada kelas/semester terpilih. Kategori lain, data ketidakhadiran dan nilai UH/ASTS/ASAS/Rapor tetap tersimpan. Upload ulang mata pelajaran kembali memperbarui kedua kategori sesuai isi Excel.

Untuk impor lama yang hanya menyimpan mata pelajaran, ekstrakurikuler dapat dilengkapi dari file sumber dengan `node scripts/repair-ledger-extracurriculars.cjs <classId> <file.xlsx>`. Perintah awal hanya pratinjau dengan rollback; tambahkan `--apply` untuk menyimpan. Skrip mencocokkan NISN dan semester pada rekap yang ada, memerlukan seluruh kode mapel, serta hanya menambahkan entri ekstrakurikuler yang belum ada. Nilai yang sudah tersimpan tidak ditimpa. Jangan gunakan untuk mengembalikan rekap yang sengaja dihapus kecuali memang diminta.

## Master akademik

`prisma/sql/20261017_academic_catalog.sql` menambahkan katalog dengan 11 mata pelajaran dan 8 ekstrakurikuler awal. Menu Akademik memiliki dropdown Peserta Didik (Siswa/Alumni), serta tautan langsung Mata Pelajaran dan Ekstrakurikuler. Katalog menyediakan pencarian, paginasi, tambah, edit nama, dan hapus. Kode tetap untuk menjaga hubungan dengan nilai; nama aktif harus unik dalam kategori yang sama. Penghapusan memakai penanda deletedAt agar kode tidak dipakai ulang dan nilai historis tetap tersedia.

Kolom penilaian mengikuti katalog aktif, ditambah kolom historis yang sudah tersimpan. File leger tetap memakai kelompok MATA PELAJARAN, Ketidakhadiran, dan Ekstra Kurikuler. Tambahkan kolom mapel sebelum Ketidakhadiran atau kolom kegiatan di kelompok Ekstra Kurikuler, menggunakan kode/nama yang terdaftar. Dua BI lama tetap diterjemahkan berurutan sebagai BI_ID dan BI_EN; untuk file baru gunakan kode unik agar tidak ambigu. Impor menolak kolom tidak dikenal/dihapus. Kolom yang tidak tercantum dalam file tetap tersimpan; sel kosong pada kolom yang tercantum mengosongkan nilainya. Nama pada riwayat nilai adalah snapshot saat penyimpanan nilai, bukan otomatis diubah saat master berganti nama.
