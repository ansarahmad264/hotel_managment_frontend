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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { shortText } from "@/lib/utils";
import {
  DeleteProductApi,
  UpdateProductApi,
  GetProductsApi,
} from "@/services/product/product.services";
import { useAuthStore } from "@/store/auth.slice";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, ArrowRight } from "lucide-react";

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
  const previewObjectUrlRef = useRef(null); // to cleanup URL.createObjectURL

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

  /* ================= EDIT ================= */
  const handleEditOpen = (product) => {
    // cleanup old preview url if any
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

    // cleanup old preview url if any
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

    // cleanup object url
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    // fallback to original imageUrl
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
        // If backend returns updated product in res.data, use it.
        // Otherwise fallback to optimistic update.
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
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Products</p>
          <h2 className="text-xl font-semibold">Menu Manager</h2>
        </div>
        <Button
          className="cursor-pointer bg-sky-600 text-white hover:bg-sky-700"
          onClick={() => navigate("/dashboard/products/add")}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* ================= DESKTOP TABLE (md+) ================= */}
      <div className="hidden md:block border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.imageUrl}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={item.name}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{shortText(item.description, 20)}</TableCell>
                  <TableCell className="font-semibold">${item.price}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditOpen(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(item)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= MOBILE CARDS (<md) ================= */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading...</div>
        ) : products.length > 0 ? (
          products.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 flex gap-4"
            >
              <img
                src={item.imageUrl}
                className="w-14 h-14 rounded-lg object-cover border"
                alt={item.name}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">${item.price}</div>
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  {shortText(item.description, 50)}
                </div>

                <div className="mt-3 flex justify-end items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditOpen(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirm(item)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500">
            No products found. Add your first product.
          </div>
        )}
      </div>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog
        open={!!editDialog}
        onOpenChange={(open) => (open ? null : closeEditDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="Name"
              required
            />

            <Textarea
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              placeholder="Description"
            />

            <Input
              type="number"
              step="0.01"
              value={editFormData.price}
              onChange={(e) =>
                setEditFormData({ ...editFormData, price: e.target.value })
              }
              required
            />

            {/* IMAGE UPLOAD */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 my-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      className="w-20 h-20 rounded-lg object-cover border"
                      alt="Preview"
                    />
                    {editImageFile ? (
                      <button
                        type="button"
                        onClick={handleRemoveUploadedImage}
                        className="absolute -top-2 -right-2 rounded-full bg-white border shadow p-1"
                        title="Remove uploaded image"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                    <ImageIcon className="text-muted-foreground" />
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
                Upload Image
              </Button>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Updating..." : "Update"}
              </Button>
              <Button variant="outline" type="button" onClick={closeEditDialog}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE ================= */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteConfirm?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
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
