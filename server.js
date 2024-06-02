const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

let cachedData = null; // Variable to cache the data

// Define API route to serve data.json
app.get('/vendors', (req, res) => {
    // If data is already cached, send it directly
    if (cachedData) {
        res.json(cachedData);
        return;
    }

    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const vendorData = JSON.parse(data).vendorData;

        // Cache the data for future requests
        cachedData = vendorData;

        res.json(vendorData);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
