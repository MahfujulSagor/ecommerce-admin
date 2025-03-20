"use client";
import { account, appwriteConfig, databases, storage } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { createContext, useState, useEffect, useContext } from "react";

// Create context for session management
const SessionContext = createContext();

// Custom hook to use session context
export const useAppwrite = () => {
  return useContext(SessionContext);
};

// Provider to manage session state
export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check session status on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true); // Set loading to true while checking session
      try {
        const session = await account.get(); // Get current user session

        const cachedAvatar = localStorage.getItem("userAvatar"); // Get cached avatar

        if (cachedAvatar) {
          setUser({ ...session, avatar: cachedAvatar }); // Set user state with session data and cached avatar
        } else {
          const userDocuments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", session.$id)]
          );

          if (!userDocuments.documents.length) {
            throw new Error("User not found!");
          }

          const userDoc = userDocuments.documents[0];
          const avatarUrl = userDoc.avatar || null;

          if (avatarUrl) {
            localStorage.setItem("userAvatar", avatarUrl); // Cache avatar
          }

          setUser({ ...session, avatar: avatarUrl }); // Set user state with session data
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null); // No session found, set user to null
      }
      setLoading(false); // Set loading to false after checking session
    };

    checkSession();
  }, []);

  // Sign in function
  const signIn = async ({ email, password }) => {
    setLoading(true); // Set loading to true while signing in
    try {
      const session = await account.createEmailPasswordSession(email, password);

      setUser({ ...session, avatar: null }); // Set user state with session data
      return { success: true };
    } catch (error) {
      console.error("Sign in failed:", error.message);
      setLoading(false); // Set loading to false after login attempt
      return { success: false, error: error.message }; // ✅ Return error properly
    } finally {
      setLoading(false); // Set loading to false after
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true); // Set loading to true while signing out
    try {
      await account.deleteSession("current"); // Delete the current session
      localStorage.removeItem("userAvatar"); // Clear cached avatar
      setUser(null); // Reset user state
    } catch (error) {
      console.error("Sign out failed:", error.message);
    } finally {
      setLoading(false); // Set loading to false after sign-out attempt
    }
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      const categories = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId
      );

      if (categories.error) {
        throw new Error(categories.error.message);
      }

      return categories.documents;
    } catch (error) {
      console.error("Fetch categories failed:", error.message);
      return [];
    }
  };

  // upload images to appwrite storage
  const uploadImages = async (files) => {
    setLoading(true); // Set loading to true while uploading images
    try {
      if (files.length === 0) {
        return [];
      }

      const promises = files.map(async (file) => {
        try {
          const response = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
          );

          // Generate the file's URL
          return storage.getFilePreview(appwriteConfig.storageId, response.$id);
        } catch (error) {
          console.error("Upload image failed:", error.message);
          return null;
        }
      });

      const imageUrls = await Promise.all(promises);

      console.log(imageUrls);
      return imageUrls;
    } catch (error) {
      console.error("Upload images failed:", error.message);
      return [];
    } finally {
      setLoading(false); // Set loading to false after image upload
    }
  };

  // create product in appwrite database
  const createNewProduct = async (data) => {
    setLoading(true); // Set loading to true while creating product
    try {
      const product = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        ID.unique(),
        data
      );

      return product;
    } catch (error) {
      console.error("Create product failed:", error.message);
      return null;
    } finally {
      setLoading(false); // Set loading to false after product
    }
  };

  // Pass session state and actions as context value
  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        signIn,
        fetchCategories,
        uploadImages,
        createNewProduct,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
