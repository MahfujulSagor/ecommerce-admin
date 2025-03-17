"use client";
import React, { useState } from "react";
import { account, appwriteConfig, avatars, databases } from "@/utils/appwrite";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create a new user
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      console.log("Signup success:", newAccount);
      if (!newAccount) throw new Error("Account creation failed");
      const avatarUrl = avatars.getInitials(name);
      const newUser = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email: email,
          password: password,
          name: name,
          avatar: avatarUrl,
        }
      );
      console.log(newUser);
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 shadow-md rounded-md w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Enter your name"
          className="border p-2 rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your password"
          className="border p-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
