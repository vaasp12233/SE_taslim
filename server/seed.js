// 1. PLACE DNS FIX AT THE VERY TOP
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 2. Load the rest of your modules
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Timetable = require("./models/Timetable");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/periodic_bell";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  if (!(await User.findOne({ username: "admin" }))) {
    await User.create({
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    console.log("✅ Admin created → admin / admin123");
  }

  if (!(await User.findOne({ username: "student" }))) {
    await User.create({
      username: "student",
      password: await bcrypt.hash("student123", 10),
      role: "student",
      section: "CSE-A",
    });
    console.log("✅ Student created → student / student123");
  }

  if ((await Timetable.countDocuments()) === 0) {
    const sample = [
      {
        section: "CSE-A",
        day: "Monday",
        period: 1,
        subject: "Maths",
        teacher: "Dr. Rao",
        room: "A101",
        startTime: "09:00",
        endTime: "09:45",
      },
      {
        section: "CSE-A",
        day: "Monday",
        period: 2,
        subject: "Physics",
        teacher: "Dr. Kumar",
        room: "A101",
        startTime: "09:45",
        endTime: "10:30",
      },
      {
        section: "CSE-A",
        day: "Monday",
        period: 3,
        subject: "Programming",
        teacher: "Ms. Priya",
        room: "Lab1",
        startTime: "10:45",
        endTime: "11:30",
      },
      {
        section: "CSE-A",
        day: "Monday",
        period: 4,
        subject: "English",
        teacher: "Mr. John",
        room: "A101",
        startTime: "11:30",
        endTime: "12:15",
      },
      {
        section: "CSE-A",
        day: "Monday",
        period: 5,
        subject: "Data Structures",
        teacher: "Dr. Rao",
        room: "A102",
        startTime: "13:00",
        endTime: "13:45",
      },
      {
        section: "CSE-A",
        day: "Tuesday",
        period: 1,
        subject: "Maths",
        teacher: "Dr. Rao",
        room: "A101",
        startTime: "09:00",
        endTime: "09:45",
      },
      {
        section: "CSE-A",
        day: "Tuesday",
        period: 2,
        subject: "DBMS",
        teacher: "Dr. Sharma",
        room: "A101",
        startTime: "09:45",
        endTime: "10:30",
      },
      {
        section: "CSE-A",
        day: "Wednesday",
        period: 1,
        subject: "Operating Sys",
        teacher: "Dr. Gupta",
        room: "A101",
        startTime: "09:00",
        endTime: "09:45",
      },
    ];
    await Timetable.insertMany(sample);
    console.log(`✅ Inserted ${sample.length} timetable entries`);
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0); // Clean exit
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
