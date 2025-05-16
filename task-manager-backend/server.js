const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Socket.IO for real-time task updates
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("addTask", async (task) => {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        await db.execute(
            "INSERT INTO tasks (id, text, completed, user, due_date) VALUES (?, ?, ?, ?, ?)",
            [task.id, task.text, task.completed, task.user, task.due_date]
        );
        const [tasks] = await db.execute("SELECT * FROM tasks");
        io.emit("taskUpdate", tasks);
        await db.end();
    });

    socket.on("updateTask", async (task) => {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        await db.execute(
            "UPDATE tasks SET completed = ?, text = ?, due_date = ? WHERE id = ?",
            [task.completed, task.text, task.due_date, task.id]
        );
        const [tasks] = await db.execute("SELECT * FROM tasks");
        io.emit("taskUpdate", tasks);
        await db.end();
    });

    socket.on("deleteTask", async (id) => {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
        const [tasks] = await db.execute("SELECT * FROM tasks");
        io.emit("taskUpdate", tasks);
        await db.end();
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));