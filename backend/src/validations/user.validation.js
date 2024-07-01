import { z } from "zod";

const userSignupSchema = z.object({
  fullName: z
    .string({
      required_error: "Full Name is required.",
      invalid_type_error: "Full Name must be a string.",
    })
    .trim()
    .min(4, { message: "Full Name must be 4 or more characters long." })
    .max(255, { message: "Full Name must be 255 or fewer characters long." }),
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .trim()
    .min(4, { message: "Username must be 4 or more characters long." })
    .max(255, { message: "Username must be 255 or fewer characters long." }),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email address." })
    .trim()
    .max(255, { message: "Email must be 255 or fewer characters long." }),
  phone: z
    .string({
      required_error: "Phone number is required.",
      invalid_type_error: "Phone number must be a string.",
    })
    .trim()
    .min(10, { message: "Phone number must be 10 or more characters long." })
    .max(10, { message: "Phone number must be 10 or fewer characters long." }),
  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .min(6, { message: "Password must be 6 or more characters long." })
    .max(255, { message: "Password must be 255 or fewer characters long." }),
});

const userLoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email address." })
    .trim()
    .max(255, { message: "Email must be 255 or fewer characters long." }),
  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .min(6, { message: "Password must be 6 or more characters long." })
    .max(255, { message: "Password must be 255 or fewer characters long." }),
});

const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: "Current Password is required.",
      invalid_type_error: "Current Password must be a string.",
    })
    .trim()
    .min(6, { message: "Current Password must be 6 or more characters long." })
    .max(255, {
      message: "Current Password must be 255 or fewer characters long.",
    }),
  newPassword: z
    .string({
      required_error: "New Password is required.",
      invalid_type_error: "New Password must be a string.",
    })
    .trim()
    .min(6, { message: "New Password must be 6 or more characters long." })
    .max(255, {
      message: "New Password must be 255 or fewer characters long.",
    }),
});

const updateUserProfileSchema = z.object({
  fullName: z
    .string({
      required_error: "Full Name is required.",
      invalid_type_error: "Full Name must be a string.",
    })
    .trim()
    .min(4, { message: "Full Name must be 4 or more characters long." })
    .max(255, { message: "Full Name must be 255 or fewer characters long." }),
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .trim()
    .min(4, { message: "Username must be 4 or more characters long." })
    .max(255, { message: "Username must be 255 or fewer characters long." }),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email address." })
    .trim()
    .max(255, { message: "Email must be 255 or fewer characters long." }),
  phone: z
    .string({
      required_error: "Phone number is required.",
      invalid_type_error: "Phone number must be a string.",
    })
    .trim()
    .min(10, { message: "Phone number must be 10 or more characters long." })
    .max(10, { message: "Phone number must be 10 or fewer characters long." }),
});

const resetPasswordRequestSchema = z.object({
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email address." })
    .trim()
    .max(255, { message: "Email must be 255 or fewer characters long." }),
});

const resetPasswordSchema = z.object({
  newPassword: z
    .string({
      required_error: "New Password is required.",
      invalid_type_error: "New Password must be a string.",
    })
    .trim()
    .min(6, { message: "New Password must be 6 or more characters long." })
    .max(255, {
      message: "New Password must be 255 or fewer characters long.",
    }),
});

export {
  userSignupSchema,
  userLoginSchema,
  changePasswordSchema,
  updateUserProfileSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
};
