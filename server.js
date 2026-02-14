// server.js
require("dotenv").config();
const app = require("./src/app"); // UBAH dari ./app menjadi ./src/app
const { PORT } = require("./src/config");
const connectDB = require("./src/config/database");

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });
