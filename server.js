const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db;
let vendorData;
let usersCollection;
let commentsCollection;

// Function to connect to the MongoDB server
async function connectToDatabase() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        db = client.db("kartmatch");
        usersCollection = db.collection('users');
        commentsCollection = db.collection('comments');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit process if unable to connect to MongoDB
    }
}

// Load JSON data once at startup
function loadVendorData() {
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return;
        }
        vendorData = JSON.parse(data).vendorData;
    });
}

// Connect to the database and load JSON data before starting the server
async function initializeServer() {
    try {
        await connectToDatabase();
        loadVendorData();
    } catch (error) {
        console.error('Error initializing server:', error);
        process.exit(1); // Exit process if server initialization fails
    }
}

initializeServer();

// Endpoint to handle user consent status
app.post('/api/users/:userId/consent', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { consent } = req.body;

        const result = await usersCollection.updateOne(
            { _id: ObjectId(userId) },
            { $set: { consentGiven: consent } }
        );

        res.status(200).json({ message: 'Consent updated successfully' });
    } catch (error) {
        console.error('Error updating user consent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to handle safety reminder agreement
app.post('/api/users/:userId/safetyReminderAgree', async (req, res) => {
    try {
        const userId = req.params.userId;
        await usersCollection.updateOne(
            { _id: ObjectId(userId) },
            { $set: { safetyReminderAgreed: true } }
        );
        res.status(200).json({ message: 'Safety reminder agreed successfully' });
    } catch (error) {
        console.error('Error agreeing to safety reminder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to handle parental consent
app.post('/api/users/:userId/parentalConsent', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { consentGiven } = req.body;
        await usersCollection.updateOne(
            { _id: ObjectId(userId) },
            { $set: { parentalConsentGiven: consentGiven } }
        );
        res.status(200).json({ message: 'Parental consent given successfully' });
    } catch (error) {
        console.error('Error giving parental consent:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get vendor data endpoint
app.get('/vendors', (req, res) => {
    if (!vendorData) {
        res.status(500).json({ error: 'Vendor data not available' });
        return;
    }
    res.json(vendorData);
});

// Get comments for a vendor endpoint
app.get('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const comments = await commentsCollection.find({ vendorId: req.params.vendorId }).toArray();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add comment for a vendor endpoint
app.post('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const newComment = {
            vendorId: req.params.vendorId,
            comment: req.body.comment,
            userId: req.body.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await commentsCollection.insertOne(newComment);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete comment endpoint
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const result = await commentsCollection.deleteOne({ _id: new ObjectId(req.params.commentId) });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
