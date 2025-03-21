"use client";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppwrite } from "@/context/AppwriteContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().nonempty("Category name is required"),
});

const CreateCategory = () => {
  const { loading, user, CreateCategory } = useAppwrite();
  const {register, handleSubmit, formState: {errors}} = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    }
  });

  const onSubmit = async (data) => {
  try {
    const category = await CreateCategory(data);

    toast.success("Category created successfully");
  } catch (error) {
    console.error("Failed to create category:", error);
    toast.error("Failed to create category");
  }
  };
  return (
    <div className="">
      <div className="flex justify-center items-center h-24">
        <TextShimmer duration={1} className="text-3xl font-bold">
          Add New Category
        </TextShimmer>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category name</Label>
          <Input
            id="name"
            autoFocus
            name="name"
            type="text"
            placeholder="category name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        <div className="flex justify-center items-center">
          <Button
            disabled={loading}
            type="submit"
            className="font-medium cursor-pointer w-full"
          >
            {loading ? <BeatLoader /> : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
