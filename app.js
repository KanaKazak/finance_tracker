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

// API route to get transactions
app.get('/transactions', (req, res) => {
    db.query('SELECT * FROM transactions ORDER BY date DESC', (err, results) => {
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
    const { user_id, type, amount, category } = req.body;
    console.log('Received data:', req.body); // Log received data

    const query = 'INSERT INTO transactions (user_id, type, amount, category) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, type, amount, category], (err) => {
        if (err) {
            console.error('Database insertion error:', err); // Log DB errors
            return res.status(500).send('Database error');
        }
        console.log('Transaction added to the database.'); // Confirm insertion
        res.send('Transaction added!');
    });
});

// Route to purge all transactions (DELETE)
app.delete('/purgeTransactions', (req, res) => {
    db.query('DELETE FROM transactions', (err, results) => {
        if (err) throw err;
        res.send('All transactions have been purged.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
