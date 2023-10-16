const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'forprotel',
    password: '12345',
    database: 'protel'
});
db.connect();

app.use(bodyParser.json());

// Get sensors
app.get('/api/readings/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    db.query('SELECT * FROM sensors WHERE node_id = ? ORDER BY timestamp DESC LIMIT 1', [nodeId], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

// Update actuators
app.post('/api/actions', (req, res) => {
    const { node_id, heater, nozzle } = req.body;
    const query = 'INSERT INTO actuators (node_id, heater, nozzle) VALUES (?, ?, ?)';
    db.query(query, [node_id, heater, nozzle], (error, results) => {
        if (error) throw error;
        res.json({ message: 'State updated successfully.' });
    });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});