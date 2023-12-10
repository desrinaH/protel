const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
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
    db.query('SELECT avg_temp FROM sensorsread WHERE node_id = ? ORDER BY timestamp DESC LIMIT 1', [nodeId], (error, results) => {
        if (error) {
            // It's a good practice to handle errors properly
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If results array is not empty, send the avg_temp, otherwise send some default value or error
            if (results.length > 0) {
                const avgTemp = results[0].avg_temp; // Extract avg_temp from the first result
                res.json({ avg_temp: avgTemp });
            } else {
                res.status(404).json({ error: 'No readings found' });
            }
        }
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
app.post('/actions/:node_id', (req, res) => {
    const node_id = req.params.node_id;
    const { status } = req.body;
    const query = 'INSERT INTO actuators (node_id, status) VALUES (?, ?)';
    db.query(query, [node_id, status], (error, results) => {
        if (error) throw error;
        res.json({ message: 'State updated successfully.' });
    });
});

app.get('/actions/:node_id', (req, res) => {
    const nodeId = req.params.node_id; // It should be req.params.node_id, not req.params.params
    db.query('SELECT status FROM actuators WHERE node_id = ? ORDER BY timestamp DESC LIMIT 1', [nodeId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length > 0) {
                const status = results[0].status; // It should be status, not avg_temp
                res.json({ status: status });
            } else {
                res.status(404).json({ error: 'No actions found' });
            }
        }
    });
});


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`); 
});