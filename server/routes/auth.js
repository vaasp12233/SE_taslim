const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Register (used by admin panel to create users)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, section } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });
    if (await User.findOne({ username }))
      return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role, section });
    res.json({ message: "User created", id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, section: user.section },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, role: user.role, username: user.username, section: user.section });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
