const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { JWT_SECRET } = require("../config");

// ================= REGISTER =================
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return passwordRegex.test(password);
};
exports.registerService = async ({ name, email, password, no_hp }) => {
  if (!name || !email || !password || !no_hp) {
    throw new Error("Semua field wajib diisi");
  }

  if (!validatePassword(password)) {
    throw new Error("Password minimal 8 karakter, harus ada huruf kecil, angka, dan karakter spesial");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    no_hp,
  });

  return newUser;
};

// ================= LOGIN =================
exports.loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Email tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      is_admin: user.is_admin,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user, token };
};
