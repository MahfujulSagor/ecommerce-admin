"use client";
import { useSession, SessionProvider, signIn } from "next-auth/react";
import Image from "next/image";
import React, { useEffect } from "react";
import google from "@/public/google.svg";
import { toast } from "sonner";

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

  useEffect(() => {
    if (status === "authenticated") {
      toast.success(`Welcome back!`);
    }
  }, [status]);

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

  if (status === "loading") {
    return <div>Loading...</div>;
  };

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
