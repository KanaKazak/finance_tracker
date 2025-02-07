const express = require('express'); // Framework for building web servers
const mysql = require('mysql2'); // MySQL library for Node.js
const bodyParser = require('body-parser'); // Middleware for parsing JSON
const app = express(); // Initialize the Express app
const port = 3000; // Port number for the server

// Database connection
const db = mysql.createConnection({
    host: 'bedvzepnvku1yrxawkm5-mysql.services.clever-cloud.com',
    user: 'udawyatuymguyrxd',
    password: 'y6RgvXsBpctiK0ZSwdx6',
    database: 'bedvzepnvku1yrxawkm5'
});

// Connect to the database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the Clever Cloud database.');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve files in the "public" folder

// API route to get transactions with optional date filters
app.get('/transactions', (req, res) => {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM transactions';
    const queryParams = [];

    if (startDate && endDate) {
        query += ' WHERE date >= ? AND date <= DATE_ADD(?, INTERVAL 1 DAY)';
        queryParams.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Failed to fetch transactions');
            return;
        }
        res.json(results);
    });
});

// API route to add a transaction
app.post('/addTransaction', (req, res) => {
    const { user_id, type, amount, category, description } = req.body; // Include description
    console.log('Received data:', req.body); // Log received data

    const query = 'INSERT INTO transactions (user_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?)'; // Update query
    db.query(query, [user_id, type, amount, category, description], (err) => { // Include description
        if (err) {
            console.error('Database insertion error:', err); // Log DB errors
            return res.status(500).send('Database error');
        }
        console.log('Transaction added to the database.'); // Confirm insertion
        res.send('Transaction added!');
    });
});

// API route to purge the database
app.post('/purgeDatabase', (req, res) => {
    const query = 'DELETE FROM transactions';
    db.query(query, (err) => {
        if (err) {
            console.error('Database purge error:', err);
            return res.status(500).send('Database purge error');
        }
        console.log('Database purged.');
        res.send('Database purged');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
