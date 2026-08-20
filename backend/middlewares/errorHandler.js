// 1. Higher-Order Function to wrap async routes and catch errors automatically
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 2. Global Express Centralized Error Handling Middleware
const globalErrorHandler = (err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR LOG:", err.stack || err.message);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // Only show full error stack in development mode
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = {
    asyncHandler,
    globalErrorHandler
};