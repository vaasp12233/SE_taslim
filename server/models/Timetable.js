const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  section: { type: String, required: true },
  day: { type: String, required: true }, // Monday ... Saturday
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, default: "" },
  room: { type: String, default: "" },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true }, // "09:45"
});

module.exports = mongoose.model("Timetable", timetableSchema);
