# Krompol Locker v.0.1 🔒

**Krompol Locker v.0.1** adalah ekstensi Google Chrome (Manifest V3) modern dan estetik yang berfungsi untuk mengamankan dan membatasi aktivitas browsing Anda melalui proteksi kata sandi. Ketika Chrome dibuka, seluruh tab akan dialihkan ke tampilan layar pengunci (*screensaver*) yang minimalis dengan jam digital besar dan kalender. Ekstensi ini dapat dibuka kunci menggunakan kata sandi bawaan **`ganteng`**.

---

## ✨ Fitur Utama

1. **Layar Pengunci Minimalis & Estetik**:
   Tampilan awal berupa jam digital raksasa dengan detik (`HH:MM:SS`) dan tanggal lengkap berukuran besar, dilapisi kolom input kata sandi berbentuk kapsul (*horizontal password pill*) yang mengambang dengan efek *glassmorphism*.

2. **Tema Adaptif Berdasarkan Waktu (Time-of-Day Themes)**:
   Latar belakang animasi gradien dinamis yang berubah secara otomatis menggambarkan waktu saat ini:
   * 🌅 **Pagi (04:00 - 10:59)**: Warna matahari terbit (emas lembut, peach, dan biru langit).
   * ☀️ **Siang (11:00 - 14:59)**: Warna siang hari cerah (kuning cerah, biru muda, dan teal bersih).
   * 🌇 **Sore (15:00 - 18:29)**: Warna senja hangat (jingga sunset, pink mawar, dan merah amber).
   * 🌌 **Malam (18:30 - 03:59)**: Mode malam (*dark-mode*) dengan gradasi biru navy tua, indigo, dan ungu gelap untuk kenyamanan mata.

3. **Ubah Kata Sandi Langsung dari Popup**:
   Fitur ubah kata sandi lokal langsung melalui widget popup ekstensi di toolbar. Menyediakan validasi kata sandi lama, kata sandi baru, dan konfirmasi kata sandi baru secara instan dan 100% aman (bypassing background script).

4. **Sinkronisasi Multi-Tab Otomatis**:
   Cukup masukkan kata sandi di salah satu tab saja, dan seluruh tab terkunci lainnya akan otomatis terbuka dan kembali memuat halaman web asalnya secara bersamaan.

5. **Proteksi Bypass Halaman Internal (`chrome://`)**:
   Untuk mencegah pengguna mematikan ekstensi melalui pengaturan Chrome saat terkunci, ekstensi akan mendeteksi dan secara otomatis **menutup tab** yang mencoba mengakses halaman konfigurasi sensitif (seperti `chrome://settings`, `chrome://extensions`, `chrome://history`, dsb).

---

## 🚀 Cara Instalasi (Developer Mode)

1. Unduh atau klon repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/polmaaa/krompol-locker.git
   ```
2. Buka browser **Google Chrome** dan navigasikan ke alamat **`chrome://extensions/`**.
3. Di pojok kanan atas, aktifkan tombol **Developer mode** ke posisi **ON**.
4. Di pojok kiri atas, klik tombol **Load unpacked**.
5. Pilih folder repositori `krompol-locker` yang telah diunduh, lalu klik **Select Folder**.
6. Ekstensi **Krompol Locker v.0.1** kini aktif dan siap mengamankan aktivitas browsing Anda!

---

## 🔑 Penggunaan & Pengujian

* **Kata Sandi Default**: `ganteng`
* **Mengunci Browser**: Klik ikon ekstensi di toolbar Chrome, lalu pilih **"Kunci Sekarang"**.
* **Mengubah Kata Sandi**: 
  1. Klik ikon ekstensi di toolbar.
  2. Buka menu akordeon **"Ubah Kata Sandi"**.
  3. Masukkan kata sandi lama (`ganteng`), kata sandi baru Anda, dan konfirmasi kata sandi baru.
  4. Klik **"Simpan Kata Sandi"** (Berlaku instan untuk semua tab terkunci).
