var http = require('http');
var urlObj = require('url');
const { MongoClient } = require("mongodb");

// Connection URI
const uri =
  "mongodb+srv://gavinmccarthybui:IWHAnTV6YAJmK3qh@testcluster.oaoex.mongodb.net/?retryWrites=true&w=majority&appName=TestCluster";

// Create a new MongoClient
const client = new MongoClient(uri);

async function getData(queryValue, searchType) {
  let results = [];
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const dbo = client.db("Stock");
    const collection = dbo.collection("PublicCompanies");

    // Define query based on search type
    let query = {};
    if (searchType === "ticker") {
      query = { stockTicker: queryValue };
    } else if (searchType === "company") {
      query = { companyName: queryValue };
    }

    // Perform query and return results
    const findResults = await collection.find(query).toArray();
    results = findResults;
  } finally {
    // Close MongoDB connection
    await client.close();
  }
  return results;
}

// HTTP server
const PORT = process.env.PORT || 8080;
http.createServer(async function (req, res) {
  const purl = urlObj.parse(req.url, true);
  const path = purl.pathname;

  if (path === '/process') {
    // Handle API request
    const queryValue = purl.query.query;
    const searchType = purl.query.searchType;

    try {
      const results = await getData(queryValue, searchType);
      
      // Prepare JSON response
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        query: queryValue,
        searchType: searchType,
        results: results
      }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  } else {
    // Handle 404 Not Found
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Endpoint not found" }));
  }
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
