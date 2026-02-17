// src/config/database.js
const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("✅ Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // ⚠️⚠️⚠️ INI PALING PENTING - HARUS TRUE ⚠️⚠️⚠️
      bufferCommands: true, // <-- PASTIKAN INI TRUE!!!

      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 2,

      // Timeout settings - diperbesar
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,

      // Retry logic
      retryWrites: true,
      retryReads: true,

      family: 4,
    };

    console.log("🔄 Connecting to MongoDB with options:", JSON.stringify(opts));

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB Connected successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("❌ Failed to get connection from promise:", e);
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
