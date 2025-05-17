import axios from 'axios';
import { toast } from 'react-toastify';

function TaskList({ tasks, fetchTasks, setEditingTask }) {
    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/tasks/${id}`, {
                headers: { 'x-auth-token': token },
            });
            toast.success('Task deleted');
            fetchTasks();
        } catch (err) {
            toast.error('Error deleting task');
        }
    };

    return (
        <div className="row">
            {tasks.map((task) => (
                <div key={task.id} className="col-md-4 mb-3">
                    <div className="card task-card">
                        <div className="card-body">
                            <h5 className="card-title">{task.title}</h5>
                            <p className="card-text">{task.description}</p>
                            <p className="card-text">
                                <strong>Priority:</strong> {task.priority}
                            </p>
                            <p className="card-text">
                                <strong>Deadline:</strong>{' '}
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                            </p>
                            <p className="card-text">
                                <strong>Reminder:</strong>{' '}
                                {task.reminder ? new Date(task.reminder).toLocaleString() : 'None'}
                            </p>
                            <button
                                className="btn btn-warning me-2"
                                onClick={() => setEditingTask(task)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(task.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TaskList;