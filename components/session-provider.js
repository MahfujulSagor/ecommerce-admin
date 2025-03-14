"use client";
import { useSession, SessionProvider, signIn } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import google from "@/public/google.svg";
import { toast } from "sonner";
import Loader from "./loader.js";

const SessionProviderWrapper = ({ children }) => {
  return (
    <SessionProvider>
      <AuthCheck>{children}</AuthCheck>
    </SessionProvider>
  );
};

export default SessionProviderWrapper;

const AuthCheck = ({ children }) => {
  const { data: session, status } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.isWelcomeMessageShown) {
      if (!sessionStorage.getItem("welcomeMessageShown")) {
        // Show success message if it's the first time this session
        toast.success(`Welcome back!`);
        sessionStorage.setItem("welcomeMessageShown", "true"); // Set flag to indicate message shown
      }
    }

    // Ensure we only check authentication once
    if (status !== "loading") {
      setChecked(true);
    }
  }, [status, session]);

  const handleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });

      if (result?.error) {
        toast.error("Sign-in failed. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  if (status === "loading" || !checked) {
    return <Loader />;
  }

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={handleSignIn}
          className="text-xl font-semibold cursor-pointer flex items-center gap-2"
        >
          <Image src={google} alt="google icon" /> Please sign in to continue
        </button>
      </div>
    );
  }
  return children;
};
