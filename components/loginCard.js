"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { BeatLoader } from "react-spinners";

// Define the schema for validation
const signInSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
});

export function LoginCard() {
  const { signIn, loading } = useSession();
  const router = useRouter();
  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const res = await signIn({
        email: data.email,
        password: data.password,
      });

      if (!res.success) {
        console.error("Failed to sign in", res.error);
        toast.error("Failed to sign in");
      } else {
        toast.success("Signed in successfully");
        router.push("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to sign in", error);
      toast.error("Failed to sign in");
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your email and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Email Input */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoFocus
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              {/* Password Input */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center items-center">
            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <BeatLoader /> : "Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
