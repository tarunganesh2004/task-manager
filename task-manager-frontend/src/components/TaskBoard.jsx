// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

function TaskBoard() {
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState("");
    const [dueDate, setDueDate] = useState("");
    const navigate = useNavigate();
    const socket = io("http://localhost:5000");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/");

        axios
            .get("http://localhost:5000/api/tasks", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => setTasks(response.data))
            .catch(() => navigate("/"));

        socket.on("taskUpdate", (updatedTasks) => {
            setTasks(updatedTasks);
        });

        return () => socket.disconnect();
    }, [navigate]);

    const addTask = (e) => {
        e.preventDefault();
        if (taskInput.trim()) {
            const newTask = {
                id: Date.now().toString(),
                text: taskInput,
                completed: false,
                user: "User", // Replace with actual username from JWT
                due_date: dueDate || null
            };
            socket.emit("addTask", newTask);
            setTaskInput("");
            setDueDate("");
        }
    };

    const toggleTask = (id) => {
        const task = tasks.find((t) => t.id === id);
        socket.emit("updateTask", { ...task, completed: !task.completed });
    };

    const deleteTask = (id) => {
        socket.emit("deleteTask", id);
    };

    return (
        <div className="container task-container py-4">
            <h1 className="text-center text-white mb-4">Collaborative Task Manager</h1>
            <form onSubmit={addTask} className="d-flex mb-4">
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Add a new task"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                />
                <input
                    type="date"
                    className="form-control me-2"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                    Add Task
                </button>
            </form>
            <div className="d-flex flex-wrap justify-content-center">
                {tasks.map((task) => (
                    <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className={task.completed ? "text-decoration-line-through" : ""}>
                                    {task.text}
                                </h5>
                                <p className="mb-0">Due: {task.due_date || "No due date"}</p>
                                <p className="mb-0">By: {task.user}</p>
                            </div>
                            <div>
                                <button
                                    className="btn btn-sm btn-outline-success me-2"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    {task.completed ? "Undo" : "Complete"}
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TaskBoard;