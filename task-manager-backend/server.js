const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const initDb = require("./config/db");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json());

// Initialize database
initDb().then(() => {
    console.log("Database initialized successfully");
}).catch((err) => {
    console.error("Database initialization failed:", err);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Socket.IO for real-time task updates
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Extract user from token (assuming token is sent via handshake)
    let user;
    const token = socket.handshake.auth.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = decoded.username;
    } catch (error) {
        console.error("Socket.IO auth error:", error);
        socket.disconnect();
        return;
    }

    socket.on("addTask", async (task) => {
        let db;
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            task.user = user; // Set the user from the authenticated token
            await db.execute(
                "INSERT INTO tasks (id, text, completed, user, due_date) VALUES (?, ?, ?, ?, ?)",
                [task.id, task.text, task.completed, task.user, task.due_date || null]
            );
            const [tasks] = await db.execute("SELECT * FROM tasks WHERE user = ?", [user]);
            console.log("Emitting taskUpdate with tasks:", tasks);
            io.emit("taskUpdate", tasks);
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            if (db) await db.end();
        }
    });

    socket.on("updateTask", async (task) => {
        let db;
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            await db.execute(
                "UPDATE tasks SET completed = ?, text = ?, due_date = ? WHERE id = ? AND user = ?",
                [task.completed, task.text, task.due_date || null, task.id, user]
            );
            const [tasks] = await db.execute("SELECT * FROM tasks WHERE user = ?", [user]);
            console.log("Emitting taskUpdate with tasks:", tasks);
            io.emit("taskUpdate", tasks);
        } catch (error) {
            console.error("Error updating task:", error);
        } finally {
            if (db) await db.end();
        }
    });

    socket.on("deleteTask", async (id) => {
        let db;
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            await db.execute("DELETE FROM tasks WHERE id = ? AND user = ?", [id, user]);
            const [tasks] = await db.execute("SELECT * FROM tasks WHERE user = ?", [user]);
            console.log("Emitting taskUpdate with tasks:", tasks);
            io.emit("taskUpdate", tasks);
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            if (db) await db.end();
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));