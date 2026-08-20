const { Router } = require("express");
const adminRouter = Router();

// Import middlewares
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const { uploadCombined } = require("../config/cloudinary");// 👈 Import Multer configs

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

// Course Routes
// Notice we use uploadCombined.fields() here!
adminRouter.post("/courses", adminMiddleware, uploadCombined.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), createCourse);
adminRouter.get("/courses", adminMiddleware, getAdminCourses);
adminRouter.put("/courses/:courseId", adminMiddleware, uploadCombined.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), updateCourse);
adminRouter.delete("/courses/:courseId", adminMiddleware, deleteCourse);

// Video Upload Route
// Notice how we use uploadCombined instead of uploadVideo!
adminRouter.post("/courses/:courseId/lessons", adminMiddleware, uploadCombined.single('video'), addLesson);

module.exports = { adminRouter };