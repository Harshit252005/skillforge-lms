const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const Course = require("../models/Course"); // 👈 Added the Course model import
const { signupSchema } = require("../zodSchemas");
const Razorpay = require("razorpay");

const JWT_USER_SECRET = process.env.JWT_USER_SECRET || "fallback_user_secret_key_123";

// 1. Controller for User Signup
const signupUser = async (req, res) => {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ 
            message: "Validation failed", 
            errors: parseResult.error.format() 
        });
    }

    const { username, password } = parseResult.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.json({ message: "User created successfully" });
    } catch (e) {
        res.status(400).json({ message: "User registration failed or user already exists" });
    }
};

// 2. Controller for User Login
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_USER_SECRET);
    res.json({ token });
};

// 3. Controller to Get All Courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json({ courses });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch courses" });
    }
};

// 4. Controller to Purchase a Course
const purchaseCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Add courseId to user's purchasedCourses array (prevents duplicate entries)
        await User.updateOne(
            { _id: req.userId },
            { $addToSet: { purchasedCourses: courseId } }
        );

        res.json({ message: "Course purchased successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to process purchase" });
    }
};

// 5. Controller to Get Purchased Courses
const getPurchasedCourses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("purchasedCourses");
        res.json({ purchasedCourses: user ? user.purchasedCourses : [] });
    } catch (e) {
        res.status(500).json({ message: "Failed to retrieve purchased courses" });
    }
};

// 6. Controller to Get a Single Course by ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json({ course });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch course details" });
    }
};
// 7. Controller to Create a Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: course.price * 100, 
            currency: "INR",
            receipt: `receipt_order_${courseId}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            message: "Order created successfully",
            order: order,
            course: course
        });

    } catch (e) {
        console.error("Razorpay Order Error:", e);
        res.status(500).json({ message: "Something went wrong creating the order" });
    }
};

// Export all the functions so your route file can use them
module.exports = { 
    signupUser, 
    loginUser, 
    getAllCourses, 
    purchaseCourse, 
    getPurchasedCourses,
    getCourseById,
    createRazorpayOrder
    
};