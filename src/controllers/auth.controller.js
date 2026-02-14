const authService = require("../services/auth.services"); // pastikan sesuai nama file
const response = require("../utils/response");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const user = await authService.registerService(req.body);

    return response.success(res, 201, "Created", {
      user,
    });
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 400, "Email dan password wajib diisi");
    }

    const { token } = await authService.loginService(req.body);

    return response.success(res, 200, "Login berhasil", {
      token,
    });
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};

// ================= ME =================

exports.getMe = async (req, res) => {
  try {
    // ubah dulu ke object biasa
    const userData = req.user.toObject();

    // hapus password
    delete userData.password;

    return response.success(res, 200, "Success", {
      user: userData,
    });
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};
