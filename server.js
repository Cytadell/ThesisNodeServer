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

// Middleware to parse form data (needed for req.body fields)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
        // Prepare Git commands
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        const git = simpleGit();

        // Check if Git is initialized
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            await git.init();
            await git.addRemote('origin', 'git@github.com:your-username/your-repo.git'); // Replace with your GitHub repo
        }

        // Add, commit, and push the file
        await git.add(filePath); // Stage the uploaded file
        await git.commit(`Add uploaded file: ${req.file.filename}`); // Commit the file
        await git.push('origin', 'main'); // Push to the GitHub repository

        console.log(`File ${req.file.filename} committed and pushed to GitHub.`);
        res.status(200).send('File uploaded and pushed to GitHub successfully!');
    } catch (err) {
        console.error('Error pushing to GitHub:', err.message);
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
