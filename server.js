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
    // const { node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6 } = req.body;
    // const query = 'INSERT INTO sensorsread (node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6) VALUES (?, ?, ?, ?, ?, ?, ?)';

    const { suhu1, suhu2, suhu3, suhu4, suhu5, suhu6 } = req.body;
    let avg1 = ( suhu1 + suhu2 + suhu3 ) / 3;
    let avg2 = ( suhu4 + suhu5 + suhu6 ) / 3;
    const node1 = 1;
    const node2 = 2;

    const query1 = 'INSERT INTO sensorsread (node1, avg1) VALUES (?, ?)';
    const query2 = 'INSERT INTO sensorsread (node2, avg2) VALUES (?, ?)';

    // db.query(query, [node_id, suhu1, suhu2, suhu3, suhu4, suhu5, suhu6], (error, results) => {
    //     if (error) throw error;
    //     res.json({ message: 'Sensor updated successfully.' });
    // });

    db.query(query1, [node_id, avg_temp], (error, results) => {
        if (error) throw error;
        res.json({ message: 'Sensor average node 1 updated successfully.' });
    });

    db.query(query2, [node_id, avg_temp], (error, results) => {
        if (error) throw error;
        res.json({ message: 'Sensor average node 2 updated successfully.' });
    });

});

// app.post('/readings', (req, res) => {
//     const { node_id, suhu1 } = req.body;
//     const query = 'INSERT INTO sensorsread (node_id, suhu1) VALUES (?, ?)';
//     db.query(query, [node_id, suhu1], (error, results) => {
//         if (error) throw error;
//         res.json({ message: 'Sensor updated successfully.' });
//     });
// });


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