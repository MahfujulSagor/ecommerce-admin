// import { z } from "zod";

// const envSchema = z.object({
//   AUTH_GOOGLE_ID: z.string().nonempty(),
//   AUTH_GOOGLE_SECRET: z.string().nonempty(),
//   AUTH_SECRET: z.string().nonempty(),
//   NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().nonempty(),
//   NEXT_PUBLIC_APPWRITE_PROJECT: z.string().nonempty(),
// });

// export const env = envSchema.parse(process.env);

import { config } from "dotenv";
config(); // Load environment variables from .env

import { z } from "zod";

const envSchema = z.object({
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url("Invalid Appwrite endpoint"),
  NEXT_PUBLIC_APPWRITE_PROJECT: z.string().min(1, "NEXT_PUBLIC_APPWRITE_PROJECT is required"),
});

// Explicitly extract variables
const rawEnv = {
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT: process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
};

// Validate extracted variables
const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  console.error("❌ Missing or invalid environment variables:", parsedEnv.error.format());
  throw new Error("Environment variables validation failed. Check logs.");
}

export const env = parsedEnv.data;
