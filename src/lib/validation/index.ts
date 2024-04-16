import * as z from "zod"

// 1. Define your schema.
export const SignupValidation = z.object({
    name: z.string().min(2, { message: "Too short"}),
    username: z.string().min(2).max(50),
    email: z.string().email({ message: "Invalid email"}),
    password: z.string().min(8, { message: "Password must be 8 characters"})
})

export const SigninValidation = z.object({
    email: z.string().email({ message: "Invalid email"}),
    password: z.string().min(8, { message: "Password must be 8 characters"})
})

export const PostValidation = z.object({
    caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
    file: z.custom<File[]>(),
    location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    tags: z.string(),
});