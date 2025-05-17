import { useEffect, useState } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

function Tasks({ user }) {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('/api/tasks', {
                headers: { 'x-auth-token': token },
            });
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks');
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user]);

    if (!user) {
        return <h2 className="text-center mt-5">Please log in to manage tasks</h2>;
    }

    return (
        <div>
            <h2 className="text-center my-4">Manage Tasks</h2>
            <TaskForm fetchTasks={fetchTasks} task={editingTask} />
            <TaskList tasks={tasks} fetchTasks={fetchTasks} setEditingTask={setEditingTask} />
        </div>
    );
}

export default Tasks;