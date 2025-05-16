const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

router.get("/", authenticate, async (req, res) => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [tasks] = await db.execute("SELECT * FROM tasks WHERE user = ?", [
            req.user.username
        ]);
        await db.end();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

module.exports = router;