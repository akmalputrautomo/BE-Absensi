const User = require("../models/user.model");
const Attendance = require("../models/attendance.model");

exports.getAllUsersService = async () => {
  const users = await User.find().select("-password -__v").sort({ createdAt: -1 });

  return users;
};

exports.getAllAbsensiService = async () => {
  try {
    // Ambil semua data attendance dengan populate user
    const attendances = await Attendance.find()
      .populate("user", "name email no_hp") // populate data user
      .sort({ date: -1, check_in: -1 }); // urut dari terbaru

    // Format response sesuai dengan yang Anda inginkan
    const formattedData = attendances.map((item) => ({
      _id: item._id,
      user: item.user
        ? {
            _id: item.user._id,
            name: item.user.name,
            email: item.user.email,
            no_hp: item.user.no_hp,
          }
        : null,
      date: item.date,
      check_in: item.check_in,
      check_out: item.check_out || null, // karena di model tidak ada check_out, bisa null
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      total: formattedData.length,
      data: formattedData,
    };
  } catch (error) {
    throw new Error(`Gagal mengambil data absensi: ${error.message}`);
  }
};

// OPTIONAL: Service dengan filter jika diperlukan nanti
exports.getFilteredAbsensiService = async (filters = {}) => {
  try {
    const { start_date, end_date, status } = filters;

    // Buat query filter
    let query = {};

    if (start_date && end_date) {
      query.date = {
        $gte: start_date,
        $lte: end_date,
      };
    }

    if (status) {
      query.status = status;
    }

    const attendances = await Attendance.find(query).populate("user", "name email no_hp").sort({ date: -1, check_in: -1 });

    const formattedData = attendances.map((item) => ({
      _id: item._id,
      user: item.user
        ? {
            _id: item.user._id,
            name: item.user.name,
            email: item.user.email,
            no_hp: item.user.no_hp,
          }
        : null,
      date: item.date,
      check_in: item.check_in,
      check_out: item.check_out || null,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      total: formattedData.length,
      data: formattedData,
    };
  } catch (error) {
    throw new Error(`Gagal mengambil data absensi: ${error.message}`);
  }
};
