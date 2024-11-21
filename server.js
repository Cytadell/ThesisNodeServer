const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create uploads folder if it doesn't exist
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to filename
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/plain', 'application/json'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Only .log, .txt, and .json files are allowed!'), false);
        } else {
            cb(null, true);
        }
    }
});

// File upload endpoint
app.post('/upload-file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded:', req.file);
    console.log('Player Name:', req.body.playerName);

    res.status(200).send('File uploaded successfully!');
}, (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).send(err.message); // Handle multer errors
    } else if (err) {
        return res.status(500).send('An error occurred while processing your request.');
    }
});

// Define the /receive-data POST route
app.post('/receive-data', (req, res) => {
    console.log('Received data:', req.body); // Log the received JSON data
    res.status(200).send('Data received successfully!');
});

// Basic root route
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
