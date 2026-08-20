const mongoose = require('mongoose');

// 1. Lesson Schema (Holds the individual video details)
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String }, // This will be the .mp4 link from Cloudinary
    duration: { type: Number, default: 0 }, // Optional: to show video length
    order: { type: Number, required: true } // Keeps videos in the correct sequence
});

// 2. Module Schema (Groups lessons together, e.g., "Section 1: Basics")
const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [lessonSchema], // Embeds the array of lessons inside this module
    order: { type: Number, required: true }
});

// 3. The Main Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageLink: { type: String },// The course thumbnail
    videoLink: { type: String }, 
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    modules: [moduleSchema], // Embeds the modules array inside the course
    isPublished: { type: Boolean, default: false }, // So admins can hide drafts
    createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
