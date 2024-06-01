const express = require('express');
const mongoose = require('mongoose');
const Vendor = require('./vendorModel');
const cors = require('cors'); // Import the cors middleware
const fs = require('fs');
const path = require('path'); // Import the path module

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Define API route to serve data.json
app.get('/vendors', (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const vendorData = JSON.parse(data).vendorData;
        res.json(vendorData);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
