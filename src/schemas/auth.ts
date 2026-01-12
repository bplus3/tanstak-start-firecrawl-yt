import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
})

export const signupSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters long"),
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})