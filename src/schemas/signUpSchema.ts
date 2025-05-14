import { z } from 'zod';

// Here we have one value so no need to create object
// Here we are using zod to validate the input for username
export const usernameValidation = z
   .string()
   .min(2, 'Username must be at least 2 characters long')
   .max(20, 'Username must be at most 20 characters long')
   .regex(/^[a-zA-Z0-9]*$/, 'Username must contain only letters and numbers');

// Here we have multiple values so we need to use object
// Here we are using zod to validate the input for signUp
export const signUpSchema = z.object({
   username: usernameValidation,
   email: z.string().email({ message: 'Invalid email address' }),
   password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
});
