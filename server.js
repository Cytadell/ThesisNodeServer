const http = require("http");
const urlObj = require("url");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://gavinmccarthybui:GktZujelVkO2wEsd@testcluster.oaoex.mongodb.net/?retryWrites=true&w=majority&appName=TestCluster";
const client = new MongoClient(uri);

const PORT = process.env.PORT || 8080;

async function addData(newData) {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const dbo = client.db("ThesisData");
    const collection = dbo.collection("GameRecords");

    // Insert the new data into the collection
    const result = await collection.insertOne(newData);
    return result;
  } finally {
    await client.close();
  }
}

// Create HTTP server
http
  .createServer(async function (req, res) {
    const purl = urlObj.parse(req.url, true);
    const path = purl.pathname;

    console.log(`Received request for path: ${path}`);

    // Add CORS headers to every response
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers

    if (req.method === "OPTIONS") {
      // Handle preflight requests for CORS
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    if (path === "/add" && req.method === "POST") {
      let body = "";

      // Collect data from the request body
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const newData = JSON.parse(body); // Parse JSON data
          const result = await addData(newData);

          // Send a success response
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              message: "Data added successfully",
              insertedId: result.insertedId,
            })
          );
        } catch (error) {
          console.error("Error adding data:", error);

          // Send an error response
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: error.message,
            })
          );
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "Endpoint not found",
        })
      );
    }
  })
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
