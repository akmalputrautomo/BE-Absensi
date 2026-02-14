const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/check-in", verifyToken, attendanceController.checkIn);
router.get("/history", verifyToken, attendanceController.getMyAttendance);

module.exports = router;
