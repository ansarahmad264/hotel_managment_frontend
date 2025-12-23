import { shortText } from "@/lib/utils";
import { GetProductsApi } from "@/services/product/product.services";
import { useAuthStore } from "@/store/auth.slice";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Stats specifically for Orders and Revenue
const stats = [
  { title: "Today's Orders", value: "€182", change: "+14% vs yesterday" },
  { title: "Total Products", value: "€12,480", change: "Daily run rate" },
];

const Home = () => {
  // navigate
  const navigate = useNavigate();
  // loading state
  const [loading, setLoading] = useState(false);
  // products
  const [products, setProducts] = useState([]);
  // user
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await GetProductsApi(user.id, 5);
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

  return (
    <div className="space-y-8">
      {/* 1. KEY STATS SECTION */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {stats.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {card.title}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* 2. RECENT ORDERS FEED */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Orders
            </h3>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Status
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Mapping through orders instead of products */}
            {[].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 py-4 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      Order #{order.id.slice(-5)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      • {order.time || "Just now"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {order.customerName} • {order.itemCount} items
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-bold text-slate-900 text-base">
                    ${order.totalAmount}
                  </p>
                  {/* Status Badge */}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider 
            ${
              order.status === "Completed"
                ? "bg-emerald-50 text-emerald-600"
                : order.status === "Pending"
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600"
            }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard/orders")}
            className="w-full py-2 text-xs font-semibold text-indigo-600 hover:bg-slate-50 rounded-lg border border-indigo-100 transition-colors"
          >
            View All Orders
          </button>
        </div>
        {/* 3. TOP PRODUCTS SECTION */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Top Products
            </h3>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Revenue
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="text-center min-h-52">Loading...</div>
            ) : (
              products.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {shortText(item.description, 50)}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900 text-base">
                    {item.price + "€"}
                  </p>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate("/dashboard/products")}
            className="w-full py-2 text-xs font-semibold text-indigo-600 hover:bg-slate-50 rounded-lg border border-indigo-100 transition-colors"
          >
            View Full Inventory
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
