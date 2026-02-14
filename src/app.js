// src/app.js
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const adminRoutes = require("./routes/admin.routes");
const cors = require("cors");
require("dotenv").config();

// Koneksi database (HATI-HATI: akan dipanggil di server.js juga)
const connectDB = require("./config/database");

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://absensi-karyawan-one.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

// ==================== DEBUG ENDPOINTS ====================
// Endpoint untuk cek status API dan environment variables
app.get("/api/debug", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: {
      mongo_uri_set: !!process.env.MONGO_URI,
      mongo_uri_prefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + "..." : null,
      node_env: process.env.NODE_ENV,
      frontend_url: process.env.FRONTEND_URL,
      jwt_secret_set: !!process.env.JWT_SECRET,
    },
    endpoints: {
      auth: "/api/auth",
      attendance: "/api/attendance",
      admin: "/api/admin",
      debug: "/api/debug",
      debug_db: "/api/debug/db",
    },
  });
});

// Endpoint untuk cek koneksi database
app.get("/api/debug/db", async (req, res) => {
  try {
    console.log("🔍 Debug DB: Mencoba koneksi ke database...");

    const connectDB = require("./config/database");
    await connectDB();

    console.log("✅ Debug DB: Koneksi berhasil, mencoba query...");

    const User = require("./models/user.model");
    const count = await User.countDocuments();

    console.log(`✅ Debug DB: Query berhasil, total user: ${count}`);

    res.json({
      status: true,
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
      data: {
        userCount: count,
        databaseName: process.env.MONGO_URI ? process.env.MONGO_URI.split("/").pop().split("?")[0] : "unknown",
        mongooseVersion: require("mongoose/package.json").version,
      },
    });
  } catch (error) {
    console.error("❌ Debug DB Error:", error);

    res.status(500).json({
      status: false,
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
});

// Endpoint untuk cek semua model
app.get("/api/debug/models", async (req, res) => {
  try {
    await connectDB();

    const User = require("./models/user.model");
    const Attendance = require("./models/attendance.model");

    const [userCount, attendanceCount] = await Promise.all([User.countDocuments(), Attendance.countDocuments()]);

    res.json({
      status: true,
      message: "Models loaded successfully",
      data: {
        models: {
          User: {
            count: userCount,
            collection: User.collection.name,
          },
          Attendance: {
            count: attendanceCount,
            collection: Attendance.collection.name,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to load models",
      error: error.message,
    });
  }
});

// Endpoint untuk test koneksi dengan timeout handling
app.get("/api/debug/ping", (req, res) => {
  res.json({
    status: true,
    message: "pong",
    time: new Date().toISOString(),
  });
});

// ==================== REGULAR ROUTES ====================
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
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      attendance: "/api/attendance",
      admin: "/api/admin",
      debug: "/api/debug",
      debug_db: "/api/debug/db",
      debug_models: "/api/debug/models",
      debug_ping: "/api/debug/ping",
    },
    documentation: "https://github.com/akmalputrautomo/BE-Absensi",
  });
});

// Handler 404
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint tidak ditemukan",
    data: null,
    available_endpoints: ["/", "/api/debug", "/api/debug/db", "/api/debug/models", "/api/debug/ping", "/api/auth", "/api/attendance", "/api/admin"],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);
  res.status(500).json({
    status: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
