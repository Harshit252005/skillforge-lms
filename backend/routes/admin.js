const { Router } = require("express");
const adminRouter = Router();
const redisClient = require('../redisClient');

// Import middlewares
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const { uploadCombined } = require("../config/cloudinary");

// Import controllers
const { 
    signupAdmin, 
    loginAdmin, 
    createCourse, 
    getAdminCourses, 
    updateCourse, 
    deleteCourse,
    addLesson 
} = require("../controllers/adminController");

// Auth Routes
adminRouter.post("/signup", signupAdmin);
adminRouter.post("/login", loginAdmin);

// Course Routes (with Redis cache invalidation)
adminRouter.post("/courses", adminMiddleware, uploadCombined.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async (req, res, next) => {
    // Clear cache when a new course is created
    await redisClient.del('all_courses');
    return createCourse(req, res, next);
});

adminRouter.get("/courses", adminMiddleware, getAdminCourses);

adminRouter.put("/courses/:courseId", adminMiddleware, uploadCombined.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async (req, res, next) => {
    // Clear cache when a course is updated
    await redisClient.del('all_courses');
    return updateCourse(req, res, next);
});

adminRouter.delete("/courses/:courseId", adminMiddleware, async (req, res, next) => {
    // Clear cache when a course is deleted
    await redisClient.del('all_courses');
    return deleteCourse(req, res, next);
});

// Video Upload Route
adminRouter.post("/courses/:courseId/lessons", adminMiddleware, uploadCombined.single('video'), addLesson);

module.exports = { adminRouter };