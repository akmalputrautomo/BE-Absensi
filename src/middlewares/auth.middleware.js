const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const User = require("../models/user.model");
const connectDB = require("../config/database"); // <-- IMPORT!

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: "Token tidak ada",
      err: "Unauthorized",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User tidak ditemukan",
        err: "Unauthorized",
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Token tidak valid",
      err: error.message,
      data: null,
    });
  }
};
