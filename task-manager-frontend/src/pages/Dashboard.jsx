import CalendarView from '../components/CalendarView';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (user) {
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
            fetchTasks();
        }
    }, [user]);

    if (!user) {
        return <h2 className="text-center mt-5">Please log in to view your dashboard</h2>;
    }

    return (
        <div>
            <h2 className="text-center my-4">Dashboard</h2>
            <CalendarView tasks={tasks} />
        </div>
    );
}

export default Dashboard;