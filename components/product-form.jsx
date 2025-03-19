"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { TextShimmer } from "./motion-primitives/text-shimmer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().nonempty("Product name is required"),
  category: z.string().nonempty("Category is required"),
  brand: z.string().nonempty("Brand is required"),
  storage: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required").max(6),
  description: z.string().nonempty("Description is required"),
  stock: z.coerce.number().int().positive("Stock must be a positive number"),
  price: z.coerce.number().positive("Price must be a positive number"),
});

const NewProduct = () => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      storage: "",
      color: "",
      images: [],
      description: "",
      stock: "",
      price: "",
    },
  });

  // Function to handle file selection
  const handleImageUpload = (event, field) => {
    const files = Array.from(event.target.files);
    const urls = files.map((file) => URL.createObjectURL(file)); // Convert to object URLs

    setValue("images", [...getValues("images"), ...urls]); // Update form state
  };

  const onSubmit = async (data) => {
    try {
      console.log("Creating product", data);
      // Call the API to create a new product
      // await createProduct(data);
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Failed to create product", error);
      toast.error("Failed to create product");
    }
  };
  return (
    <div>
      <div className="w-full flex justify-center items-center pt-5 pb-8">
        <TextShimmer className="text-3xl font-bold text-center" duration={1}>
          Add New Product
        </TextShimmer>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl space-y-6 mx-auto"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            type="text"
            name="name"
            placeholder="Product name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        <div className="flex gap-4 max-md:flex-wrap">
          <div className="w-full space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      <SelectItem value="mobiles">Mobiles</SelectItem>
                      <SelectItem value="laptops">Laptops</SelectItem>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Brand</SelectLabel>
                      <SelectItem value="samsung">Samsung</SelectItem>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="dell">Dell</SelectItem>
                      <SelectItem value="hp">HP</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="storage">Storage</Label>
          <Controller
            name="storage"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select storage option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Storage</SelectLabel>
                    <SelectItem value="64">64GB</SelectItem>
                    <SelectItem value="128">128GB</SelectItem>
                    <SelectItem value="256">256GB</SelectItem>
                    <SelectItem value="512">512GB</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            type="text"
            name="color"
            placeholder="Color"
            {...register("color")}
          />
          {errors.color && (
            <p className="text-red-500 text-sm">{errors.color.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">Images</Label>
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, field)}
                  className="hidden"
                />
                <Button
                  asChild
                  variant="ghost"
                  className="w-full min-h-40 border-2 border-dashed"
                >
                  <label htmlFor="images">Upload Images</label>
                </Button>

                {/* Image Preview */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 hover:bg-secondary rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index}`}
                        width={100}
                        height={100}
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValue(
                            "images",
                            field.value.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute top-1 right-1 hover:text-red-400 ease-in-out duration-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          />
          {errors.images && (
            <p className="text-red-500 text-sm">{errors.images.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            type="text"
            name="description"
            placeholder="Product description"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            type="number"
            name="stock"
            placeholder="Available stock"
            {...register("stock")}
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            type="number"
            name="price"
            placeholder="Product price"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Button type="submit" className="font-medium">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProduct;
