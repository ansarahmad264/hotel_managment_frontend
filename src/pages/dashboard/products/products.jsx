import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { shortText } from "@/lib/utils";
import {
  DeleteProductApi,
  UpdateProductApi,
  GetProductsApi,
} from "@/services/product/product.services";
import { useAuthStore } from "@/store/auth.slice";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

const money = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  if (Number.isNaN(n)) return "$0.00";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
};

const safeDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

const Products = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [editDialog, setEditDialog] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const [editImageFile, setEditImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const previewObjectUrlRef = useRef(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await GetProductsApi(user.id);
        setProducts(res?.success && Array.isArray(res?.data) ? res.data : []);
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user?.id]);

  // Summary stats
  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0
    );
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    return { totalProducts, totalValue, avgPrice };
  }, [products]);

  /* ================= EDIT ================= */
  const handleEditOpen = (product) => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setEditDialog(product);
    setEditFormData({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      imageUrl: product?.imageUrl ?? "",
    });

    setEditImageFile(null);
    setImagePreview(product?.imageUrl ?? "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setEditImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setImagePreview(objectUrl);
  };

  const handleRemoveUploadedImage = () => {
    setEditImageFile(null);

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setImagePreview(editFormData.imageUrl || "");
  };

  const closeEditDialog = () => {
    setEditDialog(null);
    setEditImageFile(null);

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDialog) return;

    try {
      setEditSubmitting(true);

      let payload;

      if (editImageFile) {
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("description", editFormData.description || "");
        formData.append("price", String(editFormData.price));
        formData.append("userId", String(user.id));
        formData.append("image", editImageFile);
        payload = formData;
      } else {
        payload = {
          ...editFormData,
          userId: user.id,
        };
      }

      const res = await UpdateProductApi(editDialog.id, payload);

      if (res?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editDialog.id
              ? res?.data
                ? res.data
                : { ...p, ...editFormData }
              : p
          )
        );
        toast.success("Product updated successfully");
        closeEditDialog();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await DeleteProductApi(deleteConfirm.id);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        toast.success("Deleted successfully");
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Products
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Manage your menu items and pricing
              </p>
            </div>
            <Button
              className="cursor-pointer bg-sky-600 text-white hover:bg-sky-700 shadow-lg w-full sm:w-auto"
              onClick={() => navigate("/dashboard/products/add")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
              Total Products: {summary.totalProducts}
            </div>
            <div className="rounded-full bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-700 ring-1 ring-emerald-100 shadow-sm">
              Total Value: {money(summary.totalValue)}
            </div>
            <div className="rounded-full bg-sky-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-sky-700 ring-1 ring-sky-100 shadow-sm">
              Avg Price: {money(summary.avgPrice)}
            </div>
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={item.imageUrl}
                          className="w-14 h-14 rounded-lg object-cover ring-2 ring-slate-200"
                          alt={item.name}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {shortText(item.description, 30)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {money(item.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {safeDate(item.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOpen(item)}
                            className="hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirm(item)}
                            className="bg-rose-600 hover:bg-rose-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No products found. Add your first product to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="grid gap-4 lg:hidden">
          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-lg ring-1 ring-slate-200">
              Loading...
            </div>
          ) : products.length > 0 ? (
            products.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 transition-shadow hover:shadow-xl"
              >
                {/* Card header with image */}
                <div className="border-b border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={item.imageUrl}
                      className="w-20 h-20 rounded-lg object-cover ring-2 ring-slate-200 flex-shrink-0"
                      alt={item.name}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {safeDate(item.createdAt)}
                      </p>
                      <p className="mt-2 font-bold text-xl text-sky-600">
                        {money(item.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* Description */}
                  {item.description && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-slate-700">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditOpen(item)}
                      className="hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(item)}
                      className="bg-rose-600 hover:bg-rose-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-4">
                No products found. Add your first product to get started.
              </p>
              <Button
                onClick={() => navigate("/dashboard/products/add")}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog
        open={!!editDialog}
        onOpenChange={(open) => (open ? null : closeEditDialog())}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Product Name
              </label>
              <Input
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Description
              </label>
              <Textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Price
              </label>
              <Input
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Product Image
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        className="w-24 h-24 rounded-lg object-cover ring-2 ring-slate-200"
                        alt="Preview"
                      />
                      {editImageFile && (
                        <button
                          type="button"
                          onClick={handleRemoveUploadedImage}
                          className="absolute -top-2 -right-2 rounded-full bg-white border-2 border-rose-500 shadow-lg p-1 hover:bg-rose-50 transition-colors"
                          title="Remove uploaded image"
                        >
                          <X className="h-4 w-4 text-rose-500" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center ring-2 ring-slate-200">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                onClick={closeEditDialog}
                disabled={editSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {editSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE DIALOG ================= */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteConfirm?.name}
              </span>
              ? This action cannot be undone and the product will be permanently
              removed from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
