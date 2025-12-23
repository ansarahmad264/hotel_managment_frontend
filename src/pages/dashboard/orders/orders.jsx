import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GetOrdersApi } from "@/services/orders/orders.services";
import { useAuthStore } from "@/store/auth.slice";

// Map DB status -> UI label + styles
const STATUS_META = {
  PENDING: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  CONFIRMED: { label: "Confirmed", cls: "bg-sky-50 text-sky-700 ring-sky-100" },
  DELIVERED: {
    label: "Delivered",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-rose-50 text-rose-700 ring-rose-100",
  },
};

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

const Orders = () => {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const response = await GetOrdersApi(user.id);
        if (response?.success && Array.isArray(response?.data)) {
          setOrders(response.data);
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
  }, [user?.id]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    return { totalOrders, delivered, pending };
  }, [orders]);

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
            <p className="text-sm text-slate-500">
              Track order status, totals, and delivery details.
            </p>
          </div>

          {/* Small summary chips */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Total: {summary.totalOrders}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Pending: {summary.pending}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Delivered: {summary.delivered}
            </span>
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="mt-4 hidden md:block overflow-hidden rounded-xl border border-slate-100">
          <div className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-2">Order</div>
              <div className="col-span-3">Delivery Address</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                const meta = STATUS_META[order.status] || {
                  label: order.status || "Unknown",
                  cls: "bg-slate-100 text-slate-700 ring-slate-200",
                };

                const itemsCount = Array.isArray(order?.items)
                  ? order.items.reduce(
                      (sum, it) => sum + (Number(it.quantity) || 0),
                      0
                    )
                  : 0;

                return (
                  <div
                    key={order.id}
                    className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <div className="col-span-2">
                      <div className="font-semibold text-slate-900">
                        #{order.id}
                      </div>
                      {order?.restaurant?.name ? (
                        <div className="text-xs text-slate-500">
                          {order.restaurant.name}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-3 text-slate-600">
                      <div className="line-clamp-2">
                        {order.deliveryAddress}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {itemsCount} items
                      </span>
                    </div>

                    <div className="col-span-2 text-right font-semibold text-slate-900">
                      {money(order.totalPrice)}
                    </div>

                    <div className="col-span-1 text-right text-xs text-slate-500">
                      {safeDate(order.createdAt)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                No orders found.
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="mt-4 md:hidden space-y-3">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const meta = STATUS_META[order.status] || {
                label: order.status || "Unknown",
                cls: "bg-slate-100 text-slate-700 ring-slate-200",
              };

              const itemsCount = Array.isArray(order?.items)
                ? order.items.reduce(
                    (sum, it) => sum + (Number(it.quantity) || 0),
                    0
                  )
                : 0;

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        Order #{order.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {safeDate(order.createdAt)}
                      </div>
                      {order?.restaurant?.name ? (
                        <div className="text-xs text-slate-500">
                          {order.restaurant.name}
                        </div>
                      ) : null}
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Delivery Address
                    </div>
                    <div className="mt-1 text-slate-600">
                      {order.deliveryAddress}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {itemsCount} items
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">
                      {money(order.totalPrice)}
                    </div>
                  </div>

                  {/* Optional: show first 2 items if your API includes foodItem */}
                  {Array.isArray(order?.items) && order.items.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Items
                      </div>
                      <div className="mt-2 space-y-1">
                        {order.items.slice(0, 2).map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-700">
                              {it?.foodItem?.name
                                ? it.foodItem.name
                                : `Item #${it.foodItemId}`}
                              <span className="text-slate-500">
                                {" "}
                                × {it.quantity}
                              </span>
                            </span>
                            <span className="text-slate-700">
                              {money(
                                (Number(it.unitPrice) || 0) *
                                  (Number(it.quantity) || 0)
                              )}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 ? (
                          <div className="text-xs text-slate-500">
                            +{order.items.length - 2} more...
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-500">
              No orders found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Orders;
