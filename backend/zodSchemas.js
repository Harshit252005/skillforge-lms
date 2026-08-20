const { z } = require("zod");

const signupSchema = z.object({
    username: z.string().email({ message: "Invalid email address format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

const courseSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
    price: z.number().positive({ message: "Price must be a positive number" }),
    imageLink: z.string().url({ message: "Must be a valid image URL" })
});

module.exports = {
    signupSchema,
    courseSchema
};