exports.verifyAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      status: false,
      message: "Akses ditolak. Hanya admin.",
      data: null,
    });
  }

  next();
};
