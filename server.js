const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://shiwang:shiwang@cluster0.ytjenqf.mongodb.net/kartmatch?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const commentSchema = new mongoose.Schema({
    vendorId: String,
    comment: String,
    userId: String,
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

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
        const comments = await Comment.find({ vendorId: req.params.vendorId });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/vendors/:vendorId/comments', async (req, res) => {
    try {
        const newComment = new Comment({
            vendorId: req.params.vendorId,
            comment: req.body.comment,
            userId: req.body.userId
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

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
