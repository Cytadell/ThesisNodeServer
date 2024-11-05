const express = require('express');
const cors = require('cors'); // Import the CORS package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

app.post('/receive-data', (req, res) => {
    const gameData = req.body;
    console.log("Received data:", gameData);
    res.status(200).send("Data received successfully");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
