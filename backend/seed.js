// Run from the backend folder:  node seed.js
// Needs MONGODB_URI in your local .env. Safe to re-run: it resets the demo data each time.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");
const { User } = require("./models/User");
const Course = require("./models/Course");

const DEMO_ADMIN = {
    username: "admin@skillforge.dev",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
};
const DEMO_STUDENT = {
    username: "student@skillforge.dev",
    password: process.env.SEED_STUDENT_PASSWORD || "Student@12345",
};

// Placeholder video - replace with your own uploads from the admin panel later.
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const lessons = (titles) =>
    titles.map((title, i) => ({
        title,
        description: `${title} - hands-on walkthrough with a small project.`,
        videoUrl: SAMPLE_VIDEO,
        duration: 600,
        order: i + 1,
    }));

const modules = (spec) =>
    spec.map(([title, lessonTitles], i) => ({
        title,
        order: i + 1,
        lessons: lessons(lessonTitles),
    }));

const thumb = (seed) => `https://picsum.photos/seed/${seed}/640/360`;

const COURSES = [
    {
        title: "Placement-Ready DSA in JavaScript",
        description: "Arrays, trees, graphs and dynamic programming with the patterns top product companies ask in interviews.",
        price: 999,
        imageLink: thumb("dsa"),
        modules: modules([
            ["Foundations", ["Big-O in plain English", "Arrays and hashing", "Two pointers"]],
            ["Trees and Graphs", ["Binary trees", "BFS and DFS", "Shortest paths"]],
        ]),
    },
    {
        title: "Full-Stack MERN Bootcamp",
        description: "Build and deploy a production-grade app with MongoDB, Express, React and Node, including auth and payments.",
        price: 1499,
        imageLink: thumb("mern"),
        modules: modules([
            ["Backend with Express", ["REST API design", "JWT authentication", "MongoDB with Mongoose"]],
            ["Frontend with React", ["Components and state", "Routing and forms", "Deploying to Vercel"]],
        ]),
    },
    {
        title: "System Design for Interviews",
        description: "Design URL shorteners, chat apps and feeds. Learn caching, queues, sharding and trade-off thinking.",
        price: 1299,
        imageLink: thumb("sysdesign"),
        modules: modules([
            ["Building Blocks", ["Load balancing", "Caching with Redis", "Databases at scale"]],
            ["Case Studies", ["Design a URL shortener", "Design a chat system"]],
        ]),
    },
    {
        title: "Docker and CI/CD for Developers",
        description: "Containerise your apps, write GitHub Actions pipelines and ship to the cloud with confidence.",
        price: 799,
        imageLink: thumb("docker"),
        modules: modules([
            ["Docker Essentials", ["Images and containers", "Docker Compose", "Optimising builds"]],
            ["Automation", ["GitHub Actions basics", "Automated tests and deploys"]],
        ]),
    },
    {
        title: "Build AI Apps with Gemini",
        description: "Add chat, summarisation and a personal AI tutor to your apps using the Gemini API.",
        price: 1199,
        imageLink: thumb("genai"),
        modules: modules([
            ["Getting Started", ["Your first Gemini call", "Prompting that works"]],
            ["Real Projects", ["AI tutor for lessons", "Streaming responses"]],
        ]),
    },
    {
        title: "SQL and Database Design",
        description: "From SELECT to window functions, plus schema design and indexing that holds up in interviews and at work.",
        price: 599,
        imageLink: thumb("sql"),
        modules: modules([
            ["Querying", ["SELECT, WHERE, JOIN", "Aggregations", "Window functions"]],
            ["Design", ["Normalisation", "Indexes and query plans"]],
        ]),
    },
];

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set in your .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");

    const adminHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
    const admin = await Admin.findOneAndUpdate(
        { username: DEMO_ADMIN.username },
        { username: DEMO_ADMIN.username, password: adminHash },
        { upsert: true, new: true }
    );

    const studentHash = await bcrypt.hash(DEMO_STUDENT.password, 10);
    await User.findOneAndUpdate(
        { username: DEMO_STUDENT.username },
        { username: DEMO_STUDENT.username, password: studentHash },
        { upsert: true, new: true }
    );

    await Course.deleteMany({ creatorId: admin._id });
    await Course.insertMany(
        COURSES.map((c) => ({ ...c, creatorId: admin._id, isPublished: true }))
    );

    console.log(`Seeded ${COURSES.length} courses`);
    console.log(`Demo admin:   ${DEMO_ADMIN.username} / ${DEMO_ADMIN.password}`);
    console.log(`Demo student: ${DEMO_STUDENT.username} / ${DEMO_STUDENT.password}`);

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
});