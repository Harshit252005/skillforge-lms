const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Course, Purchase } = require("./db");
const userRouter = Router();

const JWT_USER_SECRET = "harshit_user_secret_key";

// Middleware to protect user routes
function userMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ message: "Token missing" });

    try {
        const jwtToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const decoded = jwt.verify(jwtToken, JWT_USER_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
}

// 1. User Signup
userRouter.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.json({ message: "User created successfully" });
    } catch (e) {
        res.status(400).json({ message: "User already exists" });
    }
});

// 2. User Login
userRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(403).json({ message: "Incorrect credentials" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        const token = jwt.sign({ id: user._id }, JWT_USER_SECRET);
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
});

// 3. View All Available Courses (Open to all logged-in users)
userRouter.get("/courses", async (req, res) => {
    const courses = await Course.find({});
    res.json({ courses });
});

// 4. Purchase a Course (POST http://localhost:3000/api/v1/user/purchase/:courseId)
userRouter.post("/purchase/:courseId", userMiddleware, async (req, res) => {
    const { courseId } = req.params;
    const userId = req.userId;

    try {
        // Check if the course actually exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the user has already purchased this course
        const alreadyPurchased = await Purchase.findOne({ userId, courseId });
        if (alreadyPurchased) {
            return res.status(400).json({ message: "You have already purchased this course" });
        }

        // Create the purchase record
        await Purchase.create({
            userId,
            courseId
        });

        res.json({ message: "Course purchased successfully!" });
    } catch (e) {
        console.error("Purchase error:", e);
        res.status(500).json({ message: "Internal server error during purchase" });
    }
});

// 5. View My Purchased Courses (GET http://localhost:3000/api/v1/user/purchased)
userRouter.get("/purchased", userMiddleware, async (req, res) => {
    try {
        // 1. Find all purchase documents for this specific user
        const purchases = await Purchase.find({ userId: req.userId });

        // 2. Extract just the course IDs from those documents
        const courseIds = purchases.map(p => p.courseId);

        // 3. Query the Course collection for all courses matching those IDs
        const purchasedCourses = await Course.find({ _id: { $in: courseIds } });

        res.json({ purchasedCourses });
    } catch (e) {
        console.error("Fetch purchased error:", e);
        res.status(500).json({ message: "Failed to load your purchased courses" });
    }
});

// Double check that your file ends with exporting the router:
module.exports = {
    userRouter
};