import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddProductSchema from "./validation";
import { AddProductApi } from "@/services/product/product.services";
import { useAuthStore } from "@/store/auth.slice";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const AddProduct = () => {
  // navigate
  const navigate = useNavigate();
  // preview
  const [preview, setPreview] = useState(null);
  // file input key
  const [fileInputKey, setFileInputKey] = useState(0);

  const user = useAuthStore((state) => state.user);

  console.log("user----", user);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(AddProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: undefined,
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setValue("image", file, { shouldValidate: true });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleReset = () => {
    reset();
    setPreview(null);
    setFileInputKey((key) => key + 1);
  };

  console.log("user--", user);

  const handleFormSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("price", String(values.price));
    formData.append("image", values.image);

    console.log("values--", values);

    if (!values.image) {
      console.log("image is required");
      return;
    }

    if (!user?.id) {
      console.log("user or restaurant id is required");
      return;
    }
    // add item
    try {
      const response = await AddProductApi(user?.id, formData);
      console.log("response from product---", response);
      // success
      if (response?.success) {
        toast.success(response?.message, {
          description: `${values.name} ($${values.price})`,
        });
        handleReset();
      }
    } catch (error) {
      console.log("error", error);
      const { data } = error.response;
      toast.error(data.message, {
        description: `${values.name} ($${values.price})`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Products
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Add new product
          </h1>
          <p className="text-sm text-slate-500">
            Matches FoodItem fields: name, description, price, image.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/products")}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-sky-600  px-3 py-2 text-sm font-semibold  transition text-white focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Clear
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Name *
              </label>
              <input
                type="text"
                placeholder="Truffle Pasta"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="12.50"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-rose-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Short summary for guests and couriers."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-rose-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Image *
            </label>
            <input
              type="file"
              accept="image/*" //  This allows any image type (png, jpg, webp, gif, avif, etc.)
              key={fileInputKey}
              onChange={handleImageChange}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            {errors.image && (
              <p className="text-xs text-rose-600">{errors.image.message}</p>
            )}
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-48 rounded-lg border border-slate-200 object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Saving..." : "Save product"}
            </button>
            <span className="text-xs text-slate-500">
              Required fields are marked with *
            </span>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddProduct;
