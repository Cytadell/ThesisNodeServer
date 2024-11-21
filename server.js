const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a GET route for root to avoid 404 errors
app.get('/', (req, res) => {
    res.send('Welcome to the Thesis Web Server!');
});

// Define the /receive-data POST route
app.post('/receive-data', (req, res) => {
    console.log('Received data:', req.body); // Log the received JSON data
    res.status(200).send('Data received successfully!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
