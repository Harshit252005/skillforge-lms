require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const { globalErrorHandler } = require("./middlewares/errorHandler");
// Import your routers
const { adminRouter } = require("./routes/admin");
const { userRouter } = require("./routes/user"); // Include if you have user.js

const app = express();

// 1. SECURITY & CORE MIDDLEWARE (must be top)

// Add secure HTTP headers
app.use(helmet());

// 2. Enable CORS so React on port 5173 can talk to Express on port 3000
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());


// 2. RATE LIMITING (BRUTE-FORCE PROTECTION)

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 10, // Limit each IP to 10 requests per window
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter specifically to auth endpoints
app.use("/api/v1/admin/signup", authLimiter);
app.use("/api/v1/admin/login", authLimiter);


// 3. ROUTE HANDLERS

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);




// 404 Route Catch-All (For undefined endpoints)
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler Middleware (MUST HAVE 4 PARAMETERS: err, req, res, next)
app.use(globalErrorHandler);

// 4. SERVER & DATABASE INITIALIZATION

async function main() {
    // Replace with your actual MongoDB connection string
    await mongoose.connect(process.env.MONGO_URL || "mongodb+srv://adminuser:Test123456@cluster25.od2fw5g.mongodb.net/course-app?retryWrites=true&w=majority");
    console.log("Connected to MongoDB");

    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}

main();