const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI is not set. Database features will be unavailable until MongoDB is connected.");
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isLocal = mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1");
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      ...(isLocal ? {} : { ssl: true, tls: true, tlsAllowInvalidCertificates: true }),
    };

    cached.promise = mongoose
      .connect(mongoUri, options)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn("⚠️ Continuing server execution without MongoDB. Please ensure MongoDB is running or configure MONGO_URI.");
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
  }

  return cached.conn;
};

module.exports = connectDB;