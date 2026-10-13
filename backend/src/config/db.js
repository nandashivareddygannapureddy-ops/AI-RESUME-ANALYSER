const mongoose = require("mongoose");

let cached = global.mongoose;
let mongodServerInstance = null;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let lastFailedAttempt = 0;
const RETRY_COOLDOWN_MS = 20000;

async function startEmbeddedDatabase() {
  if (mongodServerInstance) {
    return mongodServerInstance.getUri() + "rozgaar_ai";
  }
  console.log("⚡ Initializing embedded in-memory MongoDB database...");
  const { MongoMemoryServer } = require("mongodb-memory-server");
  mongodServerInstance = await MongoMemoryServer.create();
  const uri = mongodServerInstance.getUri() + "rozgaar_ai";
  console.log(`✅ Embedded MongoDB ready at: ${uri}`);
  return uri;
}

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Throttle reconnect attempts if recent connection failed
  const now = Date.now();
  if (now - lastFailedAttempt < RETRY_COOLDOWN_MS) {
    return null;
  }

  const isCloudUri = mongoUri && !mongoUri.includes("localhost") && !mongoUri.includes("127.0.0.1");

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. If it's a real cloud URI (e.g. MongoDB Atlas), connect to it
      if (isCloudUri) {
        try {
          const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false,
          });
          console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
          lastFailedAttempt = 0;
          return conn;
        } catch (cloudErr) {
          console.error(`MongoDB Atlas Connection Error: ${cloudErr.message}`);
          throw cloudErr;
        }
      }

      // 2. If it's local or not provided:
      // If we are NOT in Render, attempt local connection first
      if (mongoUri && !process.env.RENDER) {
        try {
          const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000,
            bufferCommands: false,
          });
          console.log(`✅ Local MongoDB connected: ${conn.connection.host}`);
          lastFailedAttempt = 0;
          return conn;
        } catch (localErr) {
          console.warn(`Local MongoDB (${mongoUri}) unavailable (${localErr.message}). Switching to embedded database...`);
        }
      }

      // 3. Fallback: Automatically run embedded MongoDB (works out-of-the-box on Render & local!)
      try {
        if (process.env.VERCEL) {
          throw new Error("Vercel Serverless functions require a cloud MONGO_URI (MongoDB Atlas). Please add MONGO_URI to your Vercel Project Environment Variables.");
        }
        const embeddedUri = await startEmbeddedDatabase();
        const conn = await mongoose.connect(embeddedUri, {
          serverSelectionTimeoutMS: 5000,
          bufferCommands: false,
        });
        console.log(`✅ MongoDB connected successfully (Embedded Mode): ${conn.connection.host}`);
        lastFailedAttempt = 0;
        return conn;
      } catch (embedErr) {
        console.error(`Embedded MongoDB Error: ${embedErr.message}`);
        throw embedErr;
      }
    })()
      .then((conn) => {
        return conn;
      })
      .catch((error) => {
        cached.promise = null;
        lastFailedAttempt = Date.now();
        console.error(`Database Connection Notice: ${error.message}`);
        console.warn("⚠️ Continuing server execution. Set a valid cloud MONGO_URI in Render for persistent Atlas storage.");
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    lastFailedAttempt = Date.now();
  }

  return cached.conn;
};

module.exports = connectDB;