const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Course = require("../models/Course");
const redisClient = require('../redisClient');
const { signupSchema } = require("../zodSchemas");

const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || "fallback_admin_secret_key_123";
// Secret code that only you know. Without it, admin signup is disabled.
const ADMIN_SIGNUP_KEY = process.env.ADMIN_SIGNUP_KEY;

// Constant-time string comparison
function safeEqual(a, b) {
    const A = Buffer.from(String(a || ""));
    const B = Buffer.from(String(b || ""));
    return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// 1. Admin Signup Controller (locked: needs ADMIN_SIGNUP_KEY)
const signupAdmin = async (req, res) => {
    if (!ADMIN_SIGNUP_KEY) {
        return res.status(403).json({ message: "Admin signup is disabled" });
    }
    if (!safeEqual(req.body && req.body.adminKey, ADMIN_SIGNUP_KEY)) {
        return res.status(403).json({ message: "Invalid admin access code" });
    }

    const parseResult = signupSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parseResult.error.format()
        });
    }

    const { username, password } = parseResult.data;
    const normalizedUsername = username.toLowerCase().trim();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({ username: normalizedUsername, password: hashedPassword });
        res.json({ message: "Admin created successfully" });
    } catch (e) {
        res.status(400).json({ message: "Admin registration failed or admin already exists" });
    }
};

// 2. Admin Login Controller
const loginAdmin = async (req, res) => {
    const { username, password } = req.body || {};

    // Reject non-strings (blocks NoSQL injection like {"$ne": null})
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    const normalizedUsername = username.toLowerCase().trim();

    const admin = await Admin.findOne({ username: normalizedUsername });
    if (!admin) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
        const token = jwt.sign({ id: admin._id }, JWT_ADMIN_SECRET, { expiresIn: "7d" });
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
};

// 3. Create Course Controller (Cloudinary upload + Redis invalidation)
const createCourse = async (req, res) => {
    const { title, description } = req.body;
    const price = Number(req.body.price);

    if (!title || !description || Number.isNaN(price) || price < 0) {
        return res.status(400).json({ message: "Title, description and a valid price are required" });
    }

    const imageLink = req.files?.thumbnail ? req.files.thumbnail[0].path : null;
    const videoLink = req.files?.video ? req.files.video[0].path : null;

    if (!imageLink) {
        return res.status(400).json({ message: "Course thumbnail image is required" });
    }

    try {
        const newCourse = await Course.create({
            title,
            description,
            price,
            imageLink,
            videoLink,
            creatorId: req.adminId,
            modules: []
        });

        await redisClient.del('all_courses');

        res.json({ message: "Course created successfully", courseId: newCourse._id });
    } catch (e) {
        console.error("DATABASE ERROR:", e);
        res.status(500).json({ message: "Internal server error while creating course" });
    }
};

// 4. Get All Admin Courses Controller
const getAdminCourses = async (req, res) => {
    try {
        const courses = await Course.find({ creatorId: req.adminId });
        res.json({ courses });
    } catch (e) {
        res.status(500).json({ message: "Failed to retrieve courses" });
    }
};

// 5. Update Course Controller (With Redis Invalidation)
const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const { title, description } = req.body;
    const price = Number(req.body.price);

    if (!title || !description || Number.isNaN(price) || price < 0) {
        return res.status(400).json({ message: "Title, description and a valid price are required" });
    }

    try {
        const updateData = { title, description, price };

        if (req.files && req.files.thumbnail) {
            updateData.imageLink = req.files.thumbnail[0].path;
        }

        if (req.files && req.files.video) {
            updateData.videoLink = req.files.video[0].path;
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creatorId: req.adminId },
            updateData,
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        await redisClient.del('all_courses');

        res.json({ message: "Course updated successfully", course: updatedCourse });
    } catch (e) {
        console.error("UPDATE ERROR:", e);
        res.status(500).json({ message: "Internal server error while updating course" });
    }
};

// 6. Delete Course Controller (With Redis Invalidation)
const deleteCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const deletedCourse = await Course.findOneAndDelete({ _id: courseId, creatorId: req.adminId });

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        await redisClient.del('all_courses');

        res.json({ message: "Course deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Internal server error while deleting course" });
    }
};

// 7. Add Video Lesson to a Course
const addLesson = async (req, res) => {
    const { courseId } = req.params;
    const { moduleTitle, lessonTitle, lessonDescription, order } = req.body;

    const videoUrl = req.file ? req.file.path : null;

    if (!videoUrl) {
        return res.status(400).json({ message: "Video file is required" });
    }
    if (!moduleTitle || !lessonTitle || Number.isNaN(Number(order))) {
        return res.status(400).json({ message: "moduleTitle, lessonTitle and a numeric order are required" });
    }

    try {
        const course = await Course.findOne({ _id: courseId, creatorId: req.adminId });

        if (!course) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        let moduleIndex = course.modules.findIndex(m => m.title === moduleTitle);

        if (moduleIndex === -1) {
            course.modules.push({ title: moduleTitle, order: course.modules.length + 1, lessons: [] });
            moduleIndex = course.modules.length - 1;
        }

        course.modules[moduleIndex].lessons.push({
            title: lessonTitle,
            description: lessonDescription,
            videoUrl: videoUrl,
            order: Number(order)
        });

        await course.save();

        await redisClient.del('all_courses');

        res.json({ message: "Video lesson added successfully", course });
    } catch (e) {
        console.error("DATABASE ERROR (ADD LESSON):", e);
        res.status(500).json({ message: "Internal server error while adding lesson" });
    }
};

module.exports = {
    signupAdmin,
    loginAdmin,
    createCourse,
    getAdminCourses,
    updateCourse,
    deleteCourse,
    addLesson
};