const { Router } = require("express");
const userRouter = Router();

// Import logic from controller and middleware
const { userMiddleware } = require("../middlewares/userMiddleware");
const { 
    signupUser, 
    loginUser, 
    getAllCourses, 
    purchaseCourse, 
    getPurchasedCourses,
    getCourseById,
    createRazorpayOrder 
} = require("../controllers/userController");

// Import Redis Client
const redisClient = require("../redisClient");
const Course = require("../models/Course"); // Adjust path to your Course model if needed

//AI controller
const { explainConcept } = require("../controllers/aiController");

// Define URLs (Routes)
userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);

// GET all courses with Redis Caching
userRouter.get("/courses", async (req, res) => {
    try {
        // 1. Check if courses are cached in Redis RAM
        const cachedCourses = await redisClient.get('all_courses');
        
        if (cachedCourses) {
            console.log('Serving courses from Redis Cache 🚀');
            return res.json({ courses: JSON.parse(cachedCourses) });
        }

        // 2. If not cached, fetch from MongoDB
        const courses = await Course.find({});

        // 3. Store in Redis cache for 60 seconds
        await redisClient.setEx('all_courses', 60, JSON.stringify(courses));

        console.log('Serving courses from MongoDB 🐢');
        res.json({ courses });
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses", error: err.message });
    }
});

userRouter.get("/courses/:courseId", getCourseById);
userRouter.post("/courses/:courseId", userMiddleware, purchaseCourse);
userRouter.get("/purchasedCourses", userMiddleware, getPurchasedCourses);
userRouter.post("/create-order", userMiddleware, createRazorpayOrder);
userRouter.post("/ai/explain", userMiddleware, explainConcept);

module.exports = { userRouter };