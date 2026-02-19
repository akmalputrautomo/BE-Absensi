// src/services/attendance.service.js
const Attendance = require("../models/attendance.model");
const connectDB = require("../config/database");
const moment = require("moment-timezone"); // <-- TAMBAHKAN INI

// Helper: Mendapatkan waktu WIB (Asia/Jakarta)
const getWibTime = () => {
  return moment.tz("Asia/Jakarta");
};

// Helper: Mendapatkan informasi hari dalam WIB
const getDayOfWeekWib = () => {
  const wib = getWibTime();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayIndex = wib.day(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

  return {
    index: dayIndex,
    name: days[dayIndex],
  };
};

// Helper: Mendapatkan tanggal dalam format YYYY-MM-DD (berdasarkan WIB)
const getTodayWib = () => {
  return getWibTime().format("YYYY-MM-DD");
};

// Helper: Cek apakah hari ini weekend (berdasarkan WIB)
const isWeekendWib = () => {
  const dayIndex = getWibTime().day();
  return dayIndex === 0 || dayIndex === 6; // 0 = Minggu, 6 = Sabtu
};

// Helper: Cek apakah jam dalam rentang yang diizinkan (06:00 - 17:00 WIB)
const isValidCheckInTimeWib = () => {
  const wib = getWibTime();
  const hours = wib.hours();
  const minutes = wib.minutes();
  const timeInMinutes = hours * 60 + minutes;

  // Batas waktu: 06:00 (360 menit) - 17:00 (1020 menit) WIB
  return timeInMinutes >= 360 && timeInMinutes <= 1020;
};

// Helper: Tentukan status berdasarkan jam WIB
const determineStatusWib = () => {
  const wib = getWibTime();
  const hours = wib.hours();
  const minutes = wib.minutes();
  const timeInMinutes = hours * 60 + minutes;

  // 06:00 - 08:00 = Hadir (360 - 480 menit)
  if (timeInMinutes >= 360 && timeInMinutes <= 480) {
    return "Hadir";
  }
  // 08:01 - 17:00 = Terlambat (481 - 1020 menit)
  else if (timeInMinutes > 480 && timeInMinutes <= 1020) {
    return "Terlambat";
  }

  return null; // Di luar jam absen
};

// ================= ABSEN PAGI =================
exports.checkInService = async (userId) => {
  await connectDB(); // Pastikan koneksi database

  // Gunakan WIB untuk semua pengecekan
  const todayWib = getTodayWib();
  const dayInfo = getDayOfWeekWib();

  // CEK 1: Apakah hari ini weekend? (berdasarkan WIB)
  if (isWeekendWib()) {
    throw new Error(`Absen tidak tersedia di hari ${dayInfo.name} (Weekend). Hanya Senin - Jumat.`);
  }

  // CEK 2: Apakah dalam jam operasional (06:00 - 17:00 WIB)?
  if (!isValidCheckInTimeWib()) {
    throw new Error("Jam absen hanya pukul 06.00 - 17.00 WIB pada hari kerja (Senin - Jumat)");
  }

  // CEK 3: Apakah sudah absen hari ini? (gunakan tanggal WIB)
  const existing = await Attendance.findOne({
    user: userId,
    date: todayWib, // <-- Gunakan tanggal WIB
  });

  if (existing) {
    throw new Error("Anda sudah absen hari ini");
  }

  // Tentukan status berdasarkan jam WIB
  const status = determineStatusWib();

  if (!status) {
    throw new Error("Waktu absen tidak valid");
  }

  // Buat record absensi baru
  // Simpan check_in dalam format UTC (tetap aman untuk history)
  // TAPI date-nya pakai string WIB
  const attendance = await Attendance.create({
    user: userId,
    date: todayWib, // <-- String tanggal WIB
    check_in: new Date(), // <-- Tetap UTC untuk detail jam
    status,
  });

  // Return data dengan populate user
  return Attendance.findById(attendance._id).populate("user", "name email no_hp");
};

// ================= GET HISTORY + TOTAL =================
exports.getMyAttendanceService = async (userId) => {
  await connectDB(); // Pastikan koneksi database

  const attendances = await Attendance.find({ user: userId }).sort({ date: -1 });

  const totalHadir = attendances.filter((item) => item.status === "Hadir").length;
  const totalTerlambat = attendances.filter((item) => item.status === "Terlambat").length;

  return {
    total_hadir: totalHadir,
    total_terlambat: totalTerlambat,
    riwayat: attendances,
  };
};
