// src/services/attendance.service.js
const Attendance = require("../models/attendance.model");
const connectDB = require("../config/database");

// Helper: Mendapatkan hari dalam bahasa Inggris (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
const getDayOfWeek = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  return {
    index: today.getDay(),
    name: days[today.getDay()],
  };
};

// Helper: Mendapatkan tanggal dalam format YYYY-MM-DD
const getToday = () => new Date().toISOString().split("T")[0];

// Helper: Cek apakah hari ini weekend (Sabtu atau Minggu)
const isWeekend = () => {
  const dayIndex = new Date().getDay();
  return dayIndex === 0 || dayIndex === 6; // 0 = Minggu, 6 = Sabtu
};

// Helper: Cek apakah jam dalam rentang yang diizinkan (06:00 - 17:00)
const isValidCheckInTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Batas waktu: 06:00 (360 menit) - 17:00 (1020 menit)
  return timeInMinutes >= 360 && timeInMinutes <= 1020;
};

// Helper: Tentukan status berdasarkan jam
const determineStatus = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
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

  const today = getToday();
  const now = new Date();
  const dayInfo = getDayOfWeek();

  // CEK 1: Apakah hari ini weekend?
  if (isWeekend()) {
    throw new Error(`Absen tidak tersedia di hari ${dayInfo.name} (Weekend). Hanya Senin - Jumat.`);
  }

  // CEK 2: Apakah dalam jam operasional (06:00 - 17:00)?
  if (!isValidCheckInTime(now)) {
    throw new Error("Jam absen hanya pukul 06.00 - 17.00 WIB pada hari kerja (Senin - Jumat)");
  }

  // CEK 3: Apakah sudah absen hari ini?
  const existing = await Attendance.findOne({
    user: userId,
    date: today,
  });

  if (existing) {
    throw new Error("Anda sudah absen hari ini");
  }

  // Tentukan status berdasarkan jam
  const status = determineStatus(now);

  // Ini tidak akan terjadi karena sudah dicek di isValidCheckInTime,
  // tapi tetap ada untuk jaga-jaga
  if (!status) {
    throw new Error("Waktu absen tidak valid");
  }

  // Buat record absensi baru
  const attendance = await Attendance.create({
    user: userId,
    date: today,
    check_in: now,
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
