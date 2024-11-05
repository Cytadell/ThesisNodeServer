const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/receive-data', (req, res) => {
    const gameData = req.body;
    console.log("Received data:", gameData);
    res.status(200).send("Data received successfully");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
