import { config } from "dotenv";
import { account } from "./appwrite.js";

config();

const email = 'admin@admin.com';
const password = '12345678';

try {
  const user = await account.get();
  console.log("signed in successfully");
  console.log("User: ", user);
} catch (error) {
  console.log("failed to sign up", error);
}

console.log(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

