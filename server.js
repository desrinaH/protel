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
    const { suhu1, suhu2, suhu3, suhu4, suhu5, suhu6 } = req.body;
    let avg1 = (suhu1 + suhu2 + suhu3) / 3;
    let avg2 = (suhu4 + suhu5 + suhu6) / 3;
    const node1 = 1;
    const node2 = 2;

    const query1 = 'INSERT INTO sensorsread (node_id, avg_temp) VALUES (?, ?)';
    const query2 = 'INSERT INTO sensorsread (node_id, avg_temp) VALUES (?, ?)';

    db.query(query1, [node1, avg1], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error in query 1.' });
        }

        db.query(query2, [node2, avg2], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error in query 2.' });
            }

            res.json({ message: 'Sensor averages updated successfully.' }); 
        });
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

app.get('/actions/:node_id', (req, res) => { //harus buat program di mcu nya untuk sending data status ke database dan mungkin bikin table baru khusus monitoring auto
    const nodeId = req.params.node_id; 
    db.query('SELECT status FROM actuators WHERE node_id = ? ORDER BY timestamp DESC LIMIT 1', [nodeId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length > 0) {
                const status = results[0].status; 
                res.json({ status: status });
            } else {
                res.status(404).json({ error: 'No actions found' });
            }
        }
    });    
});

app.get('/sensorsread/tensecond/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    db.query('SELECT * FROM sensorsread WHERE node_id = ? ORDER BY read_id DESC LIMIT 10', [nodeId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/sensorsread/thirtymins/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    db.query('SELECT * FROM sensorsread WHERE node_id = ? AND TIMESTAMPDIFF(MINUTE, timestamp, NOW()) <= 30 ORDER BY read_id DESC', [nodeId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/sensorsread/hourly/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    const oneHourAgo = new Date(new Date().getTime() - (60*60*1000)); // Get the date and time one hour ago

    // Format the date to a string that SQL can understand, if necessary
    // This is database dependent, and the format below works for MySQL
    const formattedDate = oneHourAgo.toISOString().slice(0, 19).replace('T', ' ');

    db.query('SELECT * FROM sensorsread WHERE node_id = ? AND timestamp >= ? ORDER BY timestamp DESC', [nodeId, formattedDate], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/sensorsread/daily/:node_id', (req, res) => {
    const nodeId = req.params.node_id;
    db.query('SELECT * FROM sensorsread WHERE node_id = ? AND timestamp > NOW() - INTERVAL 24 HOUR ORDER BY timestamp DESC', [nodeId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });  
        } else {
            res.json(results);
        }
    });
});



app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`); 
});