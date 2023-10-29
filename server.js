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
app.get('/readings/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    db.query('SELECT * FROM sensorsread WHERE node_id = ? ORDER BY timestamp DESC LIMIT 1', [nodeId], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

// Update sensors
app.post('/readings', (req, res) => {
    const { node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6 } = req.body;
    const query = 'INSERT INTO sensorsread (node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6], (error, results) => {
        if (error) throw error;
        res.json({ message: 'Sensor updated successfully.' });
    });
});


// Update actuators
app.post('/actions', (req, res) => {
    const { node_id, status } = req.body;
    const query = 'INSERT INTO actuators (node_id, status) VALUES (?, ?)';
    db.query(query, [node_id, status], (error, results) => {
        if (error) throw error;
        res.json({ message: 'State updated successfully.' });
    });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});