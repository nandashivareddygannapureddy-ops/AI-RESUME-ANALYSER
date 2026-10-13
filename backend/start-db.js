const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");

async function start() {
  const dbPath = path.join(__dirname, "data/db");
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log("Starting MongoDB Server on port 27017 for MongoDB Compass...");
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: "wiredTiger",
    },
  });

  const uri = mongod.getUri();
  console.log(`\n======================================================`);
  console.log(`✅ MongoDB is LIVE and running on port 27017!`);
  console.log(`📊 You can now connect in MongoDB Compass using:`);
  console.log(`   mongodb://localhost:27017/`);
  console.log(`📁 Data is persisted in: ${dbPath}`);
  console.log(`======================================================\n`);
}

start().catch((err) => {
  console.error("MongoDB start error:", err.message);
});
