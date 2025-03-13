"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import google from "@/public/google.svg";

export default function Home() {
  const {data: session} = useSession();
  if (!session) {
    return(
      <div className="w-full min-h-screen flex items-center justify-center bg-black">
        <button className="sm:text-2xl flex justify-center items-center px-8 py-3 bg-white gap-4 text-black font-medium rounded-xl cursor-pointer" onClick={()=> signIn("google")}><Image src={google} alt="google logo"/>Sign in with google</button>
      </div>
    )
  }
  return (
    <div className="w-full min-h-screen flex items-center justify-center gap-8 bg-black">
      <h1>Logged in {session?.user?.email}</h1>
      <button className="bg-white text-2xl font-medium px-8 py-3 rounded-xl text-black cursor-pointer" onClick={()=> signOut()}>Logout</button>
    </div>
  );
}
