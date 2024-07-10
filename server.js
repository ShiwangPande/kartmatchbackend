const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://shiwang:shiwang@cluster0.ytjenqf.mongodb.net/kartmatch?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
let vendorData;
let usersCollection; // Add users collection

// Function to connect to the MongoDB server
async function connectToDatabase() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        db = client.db("kartmatch");
        usersCollection = db.collection('users'); // Initialize users collection
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
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
    await connectToDatabase();
    loadVendorData();
}

initializeServer();

// Endpoint to handle user consent status
app.post('/api/users/:userId/consent', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { consent } = req.body;

        // Update user's consent status in MongoDB
        const result = await usersCollection.updateOne(
            { _id: ObjectId(userId) },
            { $set: { consentGiven: consent } }
        );

        res.status(200).json({ message: 'Consent updated successfully' });
    } catch (error) {
        console.error('Error updating user consent:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get vendor data endpoint
app.get('/vendors', (req, res) => {
    if (!vendorData) {
        res.status(500).send('Internal Server Error');
        return;
    }
    res.json(vendorData);
});

// Get comments for a vendor endpoint
app.get('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const commentsCollection = db.collection('comments');
        const comments = await commentsCollection.find({ vendorId: req.params.vendorId }).toArray();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add comment for a vendor endpoint
app.post('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const commentsCollection = db.collection('comments');
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
        res.status(500).send('Internal Server Error');
    }
});

// Delete comment endpoint
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const commentsCollection = db.collection('comments');
        const result = await commentsCollection.deleteOne({ _id: new ObjectId(req.params.commentId) });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
