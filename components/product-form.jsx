"use client";
import React, { useEffect, useState } from "react";
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
import { ArrowLeft, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { useAppwrite } from "@/context/AppwriteContext";
import { BeatLoader } from "react-spinners";
import { decrypt } from "./encrypt-decrypt";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().nonempty("Product name is required"),
  category: z.string().nonempty("Category is required"),
  brand: z.string().nonempty("Brand is required"),
  storage: z.string().optional(),
  color: z.string().nonempty("Color is required"),
  images: z.array(z.string()).min(1, "At least one image is required").max(6),
  description: z.string().nonempty("Description is required"),
  stock: z.coerce.number().int().positive("Stock must be a positive number"),
  price: z.coerce.number().positive("Price must be a positive number"),
});

const NewProduct = () => {
  const { fetchCategories, createNewProduct, user, loading, uploadImages } =
    useAppwrite();
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Failed to fetch categories");
      }
    };
    getCategories();
  }, []);

  const selectedCategory = watch("category");

  // Function to handle file selection
  const handleImageUpload = (e, field) => {
    /*
      ---------------------------------------------Explanation----------------------------------------

      - It's mimicking the behavior of storing images. It only store blob URLs.
      - The actual image or File objects from input are stored in the state.(imageFiles)

      ---------------------------------------------Problem--------------------------------------------
       {The data object is the data that the form return when submitted.}

      - When the actual image or File objects are stored in the data object, the form validation fails.
      - It just doesn't let the onSubmit function to be called. It just stops at the form validation.
      - The form validation fails because the actual image or File objects are not serializable.
      - But the form validation works when the blob URLs are stored in data object.
      - Which is why storing the blob URLs in the data objcet is a workaround.

      ---------------------------------------------Solution-------------------------------------------

      - The actual image or File objects are stored in the state(imageFiles) for uploading to Appwrite storage.
      - The blob URLs are stored in the data object for form validation.
      - The blob URLs are stored in the data object for previewing the images.
    */
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));

    // Store the returned File objects (images) from the file input in state
    setImageFiles((pervItems) => [...pervItems, ...files]);

    if (!files.length) return;

    // Store original files for uploading
    const existingFiles = Array.isArray(getValues("images"))
      ? getValues("images")
      : [];
    const newFiles = [...existingFiles, ...urls];

    // Check if image limit is reached
    if (newFiles.length > 6) {
      toast.error("You can upload a maximum of 6 images.");
      return; // Stop if the image limit is exceeded
    }

    setValue("images", newFiles);
  };

  // handle form submission
  const onSubmit = async (data) => {
    try {
      // Find the category object from the list
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === data.category.toLowerCase()
      );

      if (!matchedCategory) {
        console.error("Category not found:", data.category);
        toast.error("Category list was outdated. Please try again.");
        return; // Exit early
      }

      if (!data.images && !data.images.length > 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      // Filter out the images and category from the data
      const { category, images, ...filteredData } = data;

      // upload images (state) in appwrite bucket
      const uploadedImageUrls = await uploadImages(imageFiles);

      if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
        toast.error("Image upload failed. Please try again.");
        return;
      }

      // I know this is dumb but i don't have time to fix it
      const userId = decrypt(user.encryptedUserId, user.iv);

      if (!userId) {
        toast.error("Failed to get user ID");
        return;
      }

      // Create the new product with actual image URLs
      const product = await createNewProduct({
        ...filteredData,
        category_id: matchedCategory.$id,
        images: uploadedImageUrls,
        seller_id: userId,
      });

      if (!product) {
        toast.error("Failed to create product");
        return;
      }

      console.log("Product created successfully", product);
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Failed to create product", error);
      toast.error("Failed to create product");
    }
  };

  const handleBackButtonClick = ()=> {
    router.back();
  };
  return (
    <div className="mb-20">
      <div>
        <Button variant='secondary' onClick={handleBackButtonClick} className='cursor-pointer' ><ArrowLeft/></Button>
      </div>
      <div className="w-full flex justify-center items-center h-24">
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
            autoFocus
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
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.$id}
                            value={category.name}
                            className="capitalize"
                          >
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="Loading">
                          Loading...
                        </SelectItem>
                      )}
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
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="microsoft">Microsoft</SelectItem>
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
        {["mobiles", "laptops", "tablets"].includes(selectedCategory) && (
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
        )}
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
                  onChange={(event) => handleImageUpload(event, field)}
                  className="hidden"
                  disabled={field.value.length >= 6}
                />
                <Button
                  asChild
                  variant="ghost"
                  disabled={field.value.length >= 6}
                  className={`w-full min-h-40 border-2 border-dashed cursor-pointer ${
                    field.value.length >= 6 && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Label
                    htmlFor="images"
                    className="flex gap-1 max:sm:flex-wrap"
                  >
                    Upload Images.{" "}
                    <span className="text-rose-400">
                      Maximun 6 images allowed
                    </span>
                  </Label>
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
                        className="absolute top-1 right-1 text-gray-400 hover:text-red-400 ease-in-out duration-100"
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
          <Button
            disabled={loading}
            type="submit"
            className="font-medium cursor-pointer w-full"
          >
            {loading ? <BeatLoader /> : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProduct;
