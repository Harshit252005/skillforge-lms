const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { adminRouter } = require("./admin");
const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON body requests


app.use(cors({
    origin: "http://localhost:5173", // Allow your React frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] // Explicitly allow the token header!
}));
        // Allows our frontend to talk to our backend safely
app.use("/api/v1/admin", adminRouter);
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: "Server is running perfectly!" });
});

// We will connect our database and routes right below here next...
const MONGO_URL = "mongodb+srv://harshit25_db_user:tdTmAi2gCNwffWQm@cluster25.od2fw5g.mongodb.net/?appName=Cluster25";

const { Admin } = require('./db'); // Make sure this import is at the top of index.js if not there

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch(err => console.error("MongoDB connection error:", err));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const { userRouter } = require("./user");

// Mount the user router under /api/v1/user
app.use("/api/v1/user", userRouter);