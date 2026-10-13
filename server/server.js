// 1. PLACE DNS OVERRIDE AT THE VERY TOP
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 2. Your existing dependencies and application setup
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const timetableRoutes = require("./routes/timetable");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/timetable", timetableRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/periodic_bell";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB error:", err.message));
