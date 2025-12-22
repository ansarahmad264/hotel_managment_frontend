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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shortText } from "@/lib/utils";
import {
  DeleteProductApi,
  UpdateProductApi,
  GetProductsApi,
} from "@/services/product/product.services";
import { useAuthStore } from "@/store/auth.slice";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Upload, X, Image as ImageIcon } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Edit States
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await GetProductsApi(user.id);
        if (response?.success && response?.data?.length > 0) {
          setProducts(response?.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        toast.error(error?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user.id]);

  // --- Handlers ---
  const handleEditOpen = (product) => {
    setEditDialog(product);
    setEditFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      imageUrl: product.imageUrl || "",
    });
    setImagePreview(product.imageUrl || "");
    setEditImageFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "imageUrl" && !editImageFile) {
      setImagePreview(value);
    }
  };

  const handleCopyUrl = () => {
    if (editFormData.imageUrl) {
      navigator.clipboard.writeText(editFormData.imageUrl);
      toast.success("URL copied to clipboard");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
    }
  };

  const handleRemoveFile = () => {
    setEditImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImagePreview(editFormData.imageUrl);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDialog) return;

    try {
      setEditSubmitting(true);

      // If your API requires FormData for file uploads, use this:
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("price", parseFloat(editFormData.price));
      formData.append("userId", user.id);

      if (editImageFile) {
        formData.append("image", editImageFile);
      } else {
        formData.append("imageUrl", editFormData.imageUrl);
      }

      // Note: Adjust UpdateProductApi to accept formData if necessary
      const response = await UpdateProductApi(
        editDialog.id,
        editImageFile
          ? formData
          : {
              ...editFormData,
              price: parseFloat(editFormData.price),
              userId: user.id,
            }
      );

      if (response?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editDialog.id
              ? { ...p, ...editFormData, price: parseFloat(editFormData.price) }
              : p
          )
        );
        toast.success("Product updated successfully");
        setEditDialog(null);
      }
    } catch (error) {
      toast.error(error?.message || "Update failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await DeleteProductApi(deleteConfirm.id);
      if (response?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        toast.success("Deleted successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-8 mt-5">
      {/* Table Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Products
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Menu manager
            </h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/products/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Add product
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-7 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            <div className="">Image</div>
            <div className="col-span-2">Item</div>
            <div>Description</div>
            <div>Price</div>
            <div className="text-right">Created At</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading products...
              </div>
            ) : products.length > 0 ? (
              products.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-7 items-center p-4 hover:bg-slate-50 transition"
                >
                  <img
                    src={item.imageUrl}
                    className="w-12 h-12 rounded-full object-cover"
                    alt=""
                  />
                  <div className="col-span-2 font-medium">{item.name}</div>
                  <div className="text-slate-500">
                    {shortText(item.description, 20)}
                  </div>
                  <div className="font-bold">${item.price}</div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOpen(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-slate-500">
                No products found. Add your first product to get started.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={handleEditChange}
                required
              />
            </div>

            {/* Image Section */}
            <div className="space-y-3">
              <Label>Product Image</Label>
              <div className="flex gap-2">
                <Input
                  name="imageUrl"
                  value={editFormData.imageUrl}
                  onChange={handleEditChange}
                  placeholder="Image URL"
                  disabled={true}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4 items-center">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="w-20 h-20 rounded-lg object-cover border"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 mt-5">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {!editImageFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-2 border rounded bg-slate-50 text-xs">
                    <span className="truncate w-32">{editImageFile.name}</span>
                    <X
                      className="h-4 w-4 cursor-pointer text-red-500"
                      onClick={handleRemoveFile}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Updating..." : "Update Product"}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={editSubmitting}
                onClick={() => setEditDialog(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-slate-900">
                "{deleteConfirm?.name}"
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
