// src/app.js
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const adminRoutes = require("./routes/admin.routes");
const cors = require("cors");
require("dotenv").config();

// Koneksi database
const connectDB = require("./config/database");
connectDB();

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://absensi-karyawan-one.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "API is running",
    time: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      attendance: "/api/attendance",
      admin: "/api/admin",
    },
  });
});

// Handler 404
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint tidak ditemukan",
    data: null,
  });
});

module.exports = app;
