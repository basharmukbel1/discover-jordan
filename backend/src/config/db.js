const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (uri) {
      await mongoose.connect(uri);
      console.log("MongoDB connected successfully");
      return;
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production.");
    }

    memoryServer = await MongoMemoryServer.create();
    const mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected to in-memory server");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
