import { Account, Avatars, Client, Databases, Storage } from "appwrite";

export const appwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
  categoryCollectionId: process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID,
  productCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
};

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
