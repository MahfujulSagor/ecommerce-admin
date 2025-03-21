"use client";

import { useAppwrite } from "@/context/AppwriteContext";
import Image from "next/image";

export default function Home() {
  const { user } = useAppwrite();

  return (
    <div className="flex gap-8 items-center justify-center">
      welcome {user?.name}{" "}
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt="User Avatar"
          height={50}
          width={50}
          className="avatar-class rounded-full"
        />
      ) : (
        <div className="default-avatar">No Avatar</div>
      )}
    </div>
  );
}
