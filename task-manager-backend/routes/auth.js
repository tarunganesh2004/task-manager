const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [
            username,
            hashedPassword
        ]);
        await db.end();
        res.status(201).json({ message: "User registered" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [users] = await db.execute("SELECT * FROM users WHERE username = ?", [
            username
        ]);
        if (users.length === 0) {
            await db.end();
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            await db.end();
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        await db.end();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

module.exports = router;