import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function TaskForm({ fetchTasks, task }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'Low');
    const [deadline, setDeadline] = useState(task?.deadline || '');
    const [reminder, setReminder] = useState(task?.reminder || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const taskData = { title, description, priority, deadline, reminder };

        try {
            if (task) {
                await axios.put(`/api/tasks/${task.id}`, taskData, {
                    headers: { 'x-auth-token': token },
                });
                toast.success('Task updated');
            } else {
                await axios.post('/api/tasks', taskData, {
                    headers: { 'x-auth-token': token },
                });
                toast.success('Task created');
            }
            fetchTasks();
            setTitle('');
            setDescription('');
            setPriority('Low');
            setDeadline('');
            setReminder('');
        } catch (err) {
            toast.error('Error saving task');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 mb-4">
            <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
            <div className="mb-3">
                <label className="form-label">Priority</label>
                <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Deadline</label>
                <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Reminder</label>
                <input
                    type="datetime-local"
                    className="form-control"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                />
            </div>
            <button type="submit" className="btn btn-primary">
                {task ? 'Update Task' : 'Add Task'}
            </button>
        </form>
    );
}

export default TaskForm;