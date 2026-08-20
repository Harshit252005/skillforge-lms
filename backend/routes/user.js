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


userRouter.get("/courses/:courseId", getCourseById);
// Define URLs (Routes)
userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.get("/courses", getAllCourses);
userRouter.post("/courses/:courseId", userMiddleware, purchaseCourse);
userRouter.get("/purchasedCourses", userMiddleware, getPurchasedCourses);

userRouter.post("/create-order", userMiddleware, createRazorpayOrder);

module.exports = { userRouter };