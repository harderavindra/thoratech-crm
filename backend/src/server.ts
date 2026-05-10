import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const { PORT = 4001, MONGO_URI } = process.env;
 
if (!MONGO_URI) { 
  console.error("MONGO_URI is not set");
  process.exit(1);
}

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB Connected");
}).catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
