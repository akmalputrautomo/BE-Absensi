const Attendance = require("../models/attendance.model");
const connectDB = require("../config/database");

const getToday = () => new Date().toISOString().split("T")[0];

// ================= ABSEN PAGI =================
exports.checkInService = async (userId) => {
  await connectDB(); // <-- TAMBAHKAN!
  const today = getToday();

  const existing = await Attendance.findOne({
    user: userId,
    date: today,
  });

  if (existing) {
    throw new Error("Anda sudah absen hari ini");
  }

  const now = new Date();
  const status = now.getHours() >= 9 ? "Terlambat" : "Hadir";

  const attendance = await Attendance.create({
    user: userId,
    date: today,
    check_in: now,
    status,
  });

  return Attendance.findById(attendance._id).populate("user", "name email no_hp");
};

// ================= GET HISTORY =================
// ================= GET HISTORY + TOTAL =================
exports.getMyAttendanceService = async (userId) => {
  await connectDB(); // <-- TAMBAHKAN!
  const attendances = await Attendance.find({ user: userId }).sort({ date: -1 });

  const totalHadir = attendances.length; // semua absensi = hadir
  const totalTerlambat = attendances.filter((item) => item.status === "Terlambat").length;

  return {
    total_hadir: totalHadir,
    total_terlambat: totalTerlambat,
    riwayat: attendances,
  };
};
