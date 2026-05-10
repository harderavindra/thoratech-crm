import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const { PORT = 4001, MONGO_URI } = process.env;
 
if (!MONGO_URI) { 
  console.error("MONGO_URI is not set");
  process.exit(1);
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected"); 
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  } 
};

startServer();
