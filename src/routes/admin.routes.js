const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/admin.middleware");

router.get("/users", verifyToken, verifyAdmin, adminController.getAllUsers);
router.get("/dataabsensiuser", verifyToken, verifyAdmin, adminController.getAllAbsensi);

module.exports = router;
