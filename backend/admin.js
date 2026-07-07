const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Admin, Course } = require("./db"); // Imports our Mongoose models
const adminRouter = Router();

// This secret key is used to sign your JWTs. Keep it private!
const JWT_ADMIN_SECRET = "harshit_admin_secret_key";

// 1. Admin Signup Route (POST http://localhost:3000/api/v1/admin/signup)
adminRouter.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash the password before saving it to MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await Admin.create({
            username: username,
            password: hashedPassword
        });

        res.json({ message: "Admin created successfully" });
    } catch (e) {
        console.log("--- ACTUAL DATABASE ERROR BELOW ---");
        console.log(e);
        console.log("-----------------------------------");
        res.status(400).json({ message: "Admin registration failed or admin already exists" });
    }
});

// 2. Admin Login Route (POST http://localhost:3000/api/v1/admin/login)
adminRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Find if the admin exists in the database
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }

    // Securely compare the incoming plain-text password with the saved database hash
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
        // Generate a stateless JWT Token signed with our secret
        const token = jwt.sign({ id: admin._id }, JWT_ADMIN_SECRET);
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
});
// 3. Admin Authentication Middleware (Verifies the incoming JWT)
function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
        req.adminId = decoded.id; // Store the admin's database ID in the request object
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

// 4. Create Course Route (POST http://localhost:3000/api/v1/admin/courses)
adminRouter.post("/courses", adminMiddleware, async (req, res) => {
    const { title, description, price, imageLink } = req.body;

    try {
        const newCourse = await Course.create({
            title,
            description,
            price,
            imageLink,
            creatorId: req.adminId // Links this specific course to the logged-in admin account
        });

        res.json({ 
            message: "Course created successfully", 
            courseId: newCourse._id 
        });
    } catch (e) {
        console.log("--- COURSE CREATION ERROR ---");
        console.log(e);
        console.log("-----------------------------");
        res.status(500).json({ message: "Internal server error while creating course" });
    }
});
// 5. Get All Admin Courses Route (GET http://localhost:3000/api/v1/admin/courses)
adminRouter.get("/courses", adminMiddleware, async (req, res) => {
    try {
        // Find all courses created by this specific admin
        const courses = await Course.find({ creatorId: req.adminId });
        res.json({ courses });
    } catch (e) {
        res.status(500).json({ message: "Failed to retrieve courses" });
    }
});
// 6. Update Course Route (PUT http://localhost:3000/api/v1/admin/courses/:courseId)
adminRouter.put("/courses/:courseId", adminMiddleware, async (req, res) => {
    const { courseId } = req.params;
    const { title, description, price, imageLink } = req.body;

    try {
        // Ensure the course belongs to the logged-in admin before updating
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creatorId: req.adminId },
            { title, description, price, imageLink },
            { new: true } // Returns the modified document rather than the original
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        res.json({ message: "Course updated successfully", course: updatedCourse });
    } catch (e) {
        res.status(500).json({ message: "Internal server error while updating course" });
    }
});

// 7. Delete Course Route (DELETE http://localhost:3000/api/v1/admin/courses/:courseId)
adminRouter.delete("/courses/:courseId", adminMiddleware, async (req, res) => {
    const { courseId } = req.params;

    try {
        // Ensure the course belongs to the logged-in admin before deleting
        const deletedCourse = await Course.findOneAndDelete({ _id: courseId, creatorId: req.adminId });

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Internal server error while deleting course" });
    }
});
module.exports = {
    adminRouter,
    JWT_ADMIN_SECRET
};