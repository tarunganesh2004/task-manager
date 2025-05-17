const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

router.post('/', auth, async (req, res) => {
    const { title, description, priority, deadline, reminder } = req.body;
    try {
        const taskId = await Task.create(
            req.user.id,
            title,
            description,
            priority,
            deadline,
            reminder
        );
        res.json({ id: taskId, msg: 'Task created' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.findByUser(req.user.id);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { title, description, priority, deadline, reminder } = req.body;
    try {
        await Task.update(req.params.id, title, description, priority, deadline, reminder);
        res.json({ msg: 'Task updated' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Task.delete(req.params.id);
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;