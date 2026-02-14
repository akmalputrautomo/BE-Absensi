const adminService = require("../services/admin.services");
const response = require("../utils/response");

exports.getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsersService();

    return response.success(res, 200, "Berhasil mengambil data seluruh user", result);
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};

exports.getAllAbsensi = async (req, res) => {
  try {
    console.log("📊 Admin mengakses semua data absensi user");

    // Panggil service untuk ambil semua data absensi
    const result = await adminService.getAllAbsensiService();

    console.log(`✅ Berhasil mengambil ${result.total} data absensi`);

    // Return response dengan format yang Anda inginkan
    return res.status(200).json({
      status: true,
      message: "Data absensi seluruh user",
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error in getAllAbsensi:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengambil data absensi",
      error: error.message,
      data: null,
    });
  }
};
