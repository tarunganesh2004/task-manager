import Calendar from 'react-calendar';
import { useState } from 'react';
import 'react-calendar/dist/Calendar.css';

function CalendarView({ tasks }) {
    const [date, setDate] = useState(new Date());

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const tasksOnDate = tasks.filter(
                (task) =>
                    task.deadline &&
                    new Date(task.deadline).toDateString() === date.toDateString()
            );
            return tasksOnDate.length > 0 ? (
                <p className="text-danger">{tasksOnDate.length} task(s)</p>
            ) : null;
        }
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={setDate}
                value={date}
                tileContent={tileContent}
                className="border-0 shadow-sm"
            />
        </div>
    );
}

export default CalendarView;