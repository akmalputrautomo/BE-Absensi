const attendanceService = require("../services/attendance.service");
const response = require("../utils/response");

// ABSEN PAGI
exports.checkIn = async (req, res) => {
  try {
    const result = await attendanceService.checkInService(req.user.id);

    return response.success(res, 200, "Absen berhasil", result);
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};

// GET HISTORY ABSENSI SENDIRI
exports.getMyAttendance = async (req, res) => {
  try {
    const result = await attendanceService.getMyAttendanceService(req.user.id);

    return response.success(res, 200, "Berhasil mengambil riwayat absensi", result);
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};
