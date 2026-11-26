require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const { globalErrorHandler } = require("./middlewares/errorHandler");
const { adminRouter } = require("./routes/admin");
const { userRouter } = require("./routes/user");

// ---------- Config (never hardcode secrets here) ----------
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
// Comma-separated list, e.g. "https://skillforge-lms-eight.vercel.app,http://localhost:5173"
const ALLOWED_ORIGINS = (process.env.CLIENT_URLS || "https://skillforge-lms-eight.vercel.app")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is not set. Add it in Render -> Environment.");
    process.exit(1);
}

["JWT_USER_SECRET", "JWT_ADMIN_SECRET"].forEach((name) => {
    if (!process.env[name]) {
        console.warn(`WARNING: ${name} is not set - an insecure fallback secret is being used. Set it in Render -> Environment.`);
    }
});

const app = express();

// Render sits behind a proxy: without this every visitor looks like the same IP
// and the rate limiter would block everyone together.
app.set("trust proxy", 1);

// ---------- Security & core middleware ----------
app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
        // allow tools like curl/Postman (no origin) and the whitelisted frontends
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json({ limit: "10kb" }));

// ---------- Rate limiting ----------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many attempts from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { message: "AI tutor limit reached for this hour, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/v1/admin/signup", authLimiter);
app.use("/api/v1/admin/login", authLimiter);
app.use("/api/v1/user/signup", authLimiter);
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/ai", aiLimiter);

// ---------- Health check (use this for UptimeRobot) ----------
app.get("/", (req, res) => {
    res.json({ name: "SkillForge API", status: "running", health: "/health" });
});

app.get("/health", (req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({
        status: dbUp ? "ok" : "degraded",
        db: dbUp ? "connected" : "disconnected",
        uptimeSeconds: Math.round(process.uptime()),
    });
});

// ---------- Routes ----------
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);

// 404 catch-all
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler (must have 4 params)
app.use(globalErrorHandler);

// ---------- Start ----------
async function main() {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

main().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
});