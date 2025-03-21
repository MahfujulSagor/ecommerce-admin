"use client";
import { encrypt } from "@/components/encrypt-decrypt";
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
        const cachedUserId = localStorage.getItem("encryptedUserId"); // Get cached user ID
        const cachedIv = localStorage.getItem("iv"); // Get cached IV

        if (cachedAvatar) {
          setUser({
            ...session,
            avatar: cachedAvatar,
            encryptedUserId: cachedUserId,
            iv: cachedIv,
          }); // Set user state with session data and cached avatar
        } else {
          const userDocuments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", session.$id)]
          );

          if (!userDocuments.documents.length) {
            throw new Error("User not found!");
          }

          const userDoc = userDocuments.documents[0]; // Get user document
          const avatarUrl = userDoc.avatar || null; // Get avatar URL
          const userId = userDoc.$id; // Get user ID
          const { iv: ivHex, encryptedData } = encrypt(userId);

          if (avatarUrl && userId) {
            localStorage.setItem("userAvatar", avatarUrl); // Cache avatar
            localStorage.setItem("encryptedUserId", encryptedData); // Cache user ID
            localStorage.setItem("iv", ivHex); // Cache IV
          }

          setUser({
            ...session,
            avatar: avatarUrl,
            encryptedUserId: encryptedData,
            iv: ivHex,
          }); // Set user state with session data
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

      setUser(session); // Set user state with session data
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
      localStorage.removeItem("encryptedUserId"); // Clear cached user ID
      localStorage.removeItem("iv"); // Clear cached IV
      setUser(null); // Reset user state
    } catch (error) {
      console.error("Sign out failed:", error.message);
    } finally {
      setLoading(false); // Set loading to false after sign-out attempt
    }
  };

  // create category in appwrite database
  const createCategory = async (data) => {
    try {
      const category = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId,
        ID.unique(),
        data
      );

      return category;
    } catch (error) {
      console.error("Create category failed:", error.message);
      return null;
    }
  };

  // fetch categories from appwrite database
  const fetchCategories = async () => {
    try {
      const categories = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId
      );

      if (categories.error) {
        console.error("Fetch categories failed:", categories.error.message);
        return;
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

  // fetch products from appwrite database
  const fetchProducts = async () => {
    try {
      const productsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        [Query.limit(5)],
      );

      const products = productsResponse.documents;

      // Fetch categories (if necessary)
      const categoriesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId
      );
      const categories = categoriesResponse.documents;

      const categoryMap = {};
      categories.forEach((category) => {
        categoryMap[category.$id] = category.name;
      });

      const updatedProducts = products.map((product) => ({
        ...product,
        category: categoryMap[product.category_id] || "Unknown",
      }));

      return updatedProducts;
    } catch (error) {
      console.error("Fetch products failed:", error.message);
      return null;
    }
  };

  // Pass session state and actions as context value
  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        signIn,
        createCategory,
        fetchCategories,
        uploadImages,
        createNewProduct,
        fetchProducts,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
