import {z} from 'zod'

export const signUpSchema = z.object({
    fullname: z.string.min(3, 'Full name must be at least 3 characters'),
    email: z.email('Invalid email address').toLowerCase(),
    password: z.string.min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'username must be at least 3 characters')
})

export const signInSchema = z.object({
    email: z.email('Invalid email address').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters')
})

