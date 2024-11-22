const express = require('express');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git'); // For Git operations

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// POST route to receive data
app.post('/receive-data', async (req, res) => {
    const gameData = req.body;
    console.log("Received data:", gameData);

    try {
        // Save data to a file in the 'data' folder
        const dataFolderPath = path.join(__dirname, 'data');
        if (!fs.existsSync(dataFolderPath)) {
            fs.mkdirSync(dataFolderPath); // Create folder if it doesn't exist
        }

        const timestamp = Date.now();
        const filePath = path.join(dataFolderPath, `gameData-${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2));

        console.log(`Data saved to file: ${filePath}`);

        // Commit and push the file to GitHub
        const git = simpleGit();
        await git.add(filePath);
        await git.commit(`Add game data: gameData-${timestamp}.json`);
        await git.push();

        console.log("File committed and pushed to GitHub successfully.");
        res.status(200).send("Data received and saved successfully!");
    } catch (error) {
        console.error("Error saving data or pushing to GitHub:", error.message);
        res.status(500).send("Error saving data or pushing to GitHub.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
