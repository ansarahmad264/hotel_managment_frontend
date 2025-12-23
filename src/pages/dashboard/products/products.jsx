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
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";

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

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await GetProductsApi(user.id);
        setProducts(res?.success ? res.data : []);
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user.id]);

  /* ================= EDIT ================= */
  const handleEditOpen = (product) => {
    setEditDialog(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setEditImageFile(null);
    setImagePreview(product.imageUrl); // existing image preview
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // instant preview
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDialog) return;

    try {
      setEditSubmitting(true);

      let payload;

      if (editImageFile) {
        // send FormData when uploading file
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("description", editFormData.description);
        formData.append("price", editFormData.price);
        formData.append("userId", user.id);
        formData.append("image", editImageFile);
        payload = formData;
      } else {
        // normal JSON update
        payload = {
          ...editFormData,
          userId: user.id,
        };
      }

      const res = await UpdateProductApi(editDialog.id, payload);

      if (res?.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editDialog.id ? res.data : p))
        );
        toast.success("Product updated successfully");
        setEditDialog(null);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    try {
      const res = await DeleteProductApi(deleteConfirm.id);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        toast.success("Deleted successfully");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Products</p>
          <h2 className="text-xl font-semibold">Menu Manager</h2>
        </div>
        <Button
          className="cursor-pointer bg-sky-600 text-white hover:bg-sky-600"
          onClick={() => navigate("/dashboard/products/add")}
        >
          <ArrowRight className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block border rounded-xl">
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
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {products.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.imageUrl}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{shortText(item.description, 20)}</TableCell>
                  <TableCell>${item.price}</TableCell>
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
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
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
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
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
                onClick={() => fileInputRef.current.click()}
                className="w-full mt-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Updating..." : "Update"}
              </Button>
              <Button variant="outline" onClick={() => setEditDialog(null)}>
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
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
