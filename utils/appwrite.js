import { Account, Avatars, Client, Databases } from "appwrite";

export const appwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
};

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);
