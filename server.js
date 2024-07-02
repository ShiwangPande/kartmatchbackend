const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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

// Function to connect to the MongoDB server
async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    db = client.db("kartmatch");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Connect to the database before starting the server
connectToDatabase();

app.get('/vendors', (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(JSON.parse(data).vendorData);
    });
});

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

app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const commentsCollection = db.collection('comments');
        await commentsCollection.deleteOne({ _id: new MongoClient.ObjectId(req.params.commentId) });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
