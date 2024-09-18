const http = require('http')
const express = require('express');
const path = require("path");
const port = 9005;
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


// Socket.io
app.use(express.static(path.resolve("./public")));



let tasks = [];

app.use(express.json());

// Route to get tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Route to add a new task
app.post('/tasks', (req, res) => {
    const newTask = req.body;
    tasks.push(newTask);

    //new task
    io.emit('task added', newTask);
    res.status(201).json(newTask);
});

// Route to update a task
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const updatedTask = req.body;

    tasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));

    // task update
    io.emit('task updated', updatedTask);
    res.json(updatedTask);
});

// Route to add a new comment to a task
app.post('/tasks/:id/comments', (req, res) => {
    const taskId = req.params.id;
    const newComment = req.body.comment;

    tasks = tasks.map((task) => {
        if (task.id === taskId) {
            task.comments = [...task.comments, newComment];
            return task;
        }
        return task;
    });

    // new comment
    io.emit('comment added', { taskId, newComment });
    res.status(201).json({ taskId, newComment });
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');
});


server.listen(port, (err) => {
    (err) ? console.log("server not connect") : console.log("server is connect", port);

})

