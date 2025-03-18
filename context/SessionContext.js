"use client";
import { account, appwriteConfig, databases } from "@/utils/appwrite";
import { Query } from "appwrite";
import { createContext, useState, useEffect, useContext } from "react";

// Create context for session management
const SessionContext = createContext();

// Custom hook to use session context
export const useSession = () => {
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

  // Pass session state and actions as context value
  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
