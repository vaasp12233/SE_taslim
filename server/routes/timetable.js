const express = require("express");
const Timetable = require("../models/Timetable");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET (filter by section & day)
router.get("/", auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = req.query.section;
    if (req.query.day) filter.day = req.query.day;
    const entries = await Timetable.find(filter).sort({ period: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (admin)
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const entry = await Timetable.create(req.body);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (admin)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
