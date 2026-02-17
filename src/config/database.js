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
      bufferCommands: true, // ✅ UBAH JADI TRUE!
      maxPoolSize: 10, // ✅ Naikkan sedikit
      minPoolSize: 2, // ✅ TAMBAHKAN (jaga koneksi minimal)
      serverSelectionTimeoutMS: 30000, // ✅ Naikkan jadi 30 detik
      socketTimeoutMS: 60000, // ✅ Naikkan jadi 60 detik
      connectTimeoutMS: 30000, // ✅ TAMBAHKAN
      retryWrites: true, // ✅ TAMBAHKAN
      retryReads: true, // ✅ TAMBAHKAN
      family: 4,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB Connected");
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
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
