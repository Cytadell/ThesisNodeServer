const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git'); // To manage Git commands

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
const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload-file', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded:', req.file);
    console.log('Player Name:', req.body.playerName);

    try {
        // Commit the file to the GitHub repository
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        const git = simpleGit();

        await git.add(filePath); // Stage the uploaded file
        await git.commit(`Add uploaded file: ${req.file.filename}`); // Commit the file
        await git.push(); // Push to the GitHub repository

        console.log(`File ${req.file.filename} committed and pushed to GitHub.`);
        res.status(200).send('File uploaded and pushed to GitHub successfully!');
    } catch (err) {
        console.error('Error pushing to GitHub:', err);
        res.status(500).send('Error uploading file to GitHub.');
    }
});

// Basic root route for testing
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
