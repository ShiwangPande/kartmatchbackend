const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

let cachedData = null; // Variable to cache the data

// MongoDB connection
mongoose.connect('mongodb+srv://shiwang:shiwang@cluster0.ytjenqf.mongodb.net/kartmatch?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Comment model
const commentSchema = new mongoose.Schema({
    vendorId: String,
    comment: String,
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

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

// Endpoint to get comments for a vendor
app.get('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ vendorId: req.params.vendorId });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to add a comment for a vendor
app.post('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const newComment = new Comment({
            vendorId: req.params.vendorId,
            comment: req.body.comment,
        });
        await newComment.save();
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to delete a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
