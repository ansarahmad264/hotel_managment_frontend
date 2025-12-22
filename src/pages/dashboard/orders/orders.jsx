import { GetOrdersApi } from "@/services/orders/orders.services";
import { useAuthStore } from "@/store/auth.slice";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  Ready: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "In Kitchen": "bg-sky-50 text-sky-700 ring-sky-100",
  "On the way": "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

const Orders = () => {
  // orders
  const [orders, setOrders] = useState([]);
  // user
  const user = useAuthStore((state) => state.user);
  // loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await GetOrdersApi(user.id);
        if (response?.success && response?.data?.length > 0) {
          setOrders(response?.data);
        } else {
          setOrders([]);
        }
      } catch (error) {
        toast.error(error?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 mt-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
            <p className="text-sm text-slate-500">
              You can view the status of orders
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-6 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            <div>Order</div>
            <div>Customer</div>
            <div>Channel</div>
            <div>Status</div>
            <div className="text-right">Total</div>
            <div className="text-right">ETA</div>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <div className="text-center min-h-52">Loading...</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-6 items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <div className="font-semibold text-slate-900">{order.id}</div>
                  <div>{order.customer}</div>
                  <div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {order.channel}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        statusStyles[order.status] ||
                        "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-slate-900">
                    {order.total}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {order.eta}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Orders;
