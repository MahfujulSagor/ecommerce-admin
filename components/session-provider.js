"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "./loader.js";
import { LoginCard } from "./loginCard.js";
import { SessionProvider, useAppwrite} from "@/context/AppwriteContext.js";

const SessionProviderWrapper = ({ children }) => {
  return (
    <SessionProvider>
      <AuthCheck>{children}</AuthCheck>
    </SessionProvider>
  );
};

export default SessionProviderWrapper;

const AuthCheck = ({ children }) => {
  const { user, loading } = useAppwrite();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // If the session is authenticated, show a welcome message and store it in sessionStorage
    if (user && !user.isWelcomeMessageShown) {
      if (!sessionStorage.getItem("welcomeMessageShown")) {
        // Show success message if it's the first time this session
        toast.success(`Welcome back!`);
        sessionStorage.setItem("welcomeMessageShown", "true"); // Set flag to indicate message shown
      }
    }

    if (!loading) {
      setChecked(true);
    }
  }, [loading, user]);

  if (loading || !checked) {
    return <Loader />;
  }

  // If no session, show Login Card
  if (!user) {
    return <LoginCard />;
  }
  return children;
};
