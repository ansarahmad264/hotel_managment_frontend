import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GetOrdersApi,
  UpdateOrderApi,
} from "@/services/orders/orders.services";
import { useAuthStore } from "@/store/auth.slice";

// Map DB status -> UI label + styles
const STATUS_META = {
  PENDING: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    cls: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  DELIVERED: {
    label: "Delivered",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-rose-50 text-rose-700 ring-rose-100",
  },
};

const STATUSES = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

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
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch orders
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

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await UpdateOrderApi(orderId, { status: newStatus });

      if (response?.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(
          `Order #${orderId} updated to ${
            STATUS_META[newStatus]?.label || newStatus
          }`
        );
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    return { totalOrders, delivered, pending };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Orders
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              Track order status, totals, and delivery details.
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
              Total: {summary.totalOrders}
            </div>
            <div className="rounded-full bg-amber-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-700 ring-1 ring-amber-100 shadow-sm">
              Pending: {summary.pending}
            </div>
            <div className="rounded-full bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-700 ring-1 ring-emerald-100 shadow-sm">
              Delivered: {summary.delivered}
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
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Delivery Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Date
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
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-900">
                              #{order.id}
                            </span>
                            {order.user?.name && (
                              <span className="text-sm text-slate-600">
                                {order.user.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {order.deliveryAddress}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order.id, e.target.value)
                            }
                            disabled={updatingOrderId === order.id}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all cursor-pointer ${
                              meta.cls
                            } ${
                              updatingOrderId === order.id
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:ring-2"
                            }`}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_META[status]?.label || status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                            <svg
                              className="h-4 w-4 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                            {itemsCount} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {money(order.totalPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {safeDate(order.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No orders found.
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
                  className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 transition-shadow hover:shadow-xl"
                >
                  {/* Card header */}
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {safeDate(order.createdAt)}
                        </p>
                        {order.user?.name && (
                          <p className="text-sm text-slate-700 mt-1 font-medium">
                            {order.user.name}
                          </p>
                        )}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        disabled={updatingOrderId === order.id}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-all flex-shrink-0 ${
                          meta.cls
                        } ${
                          updatingOrderId === order.id
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:ring-2"
                        }`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_META[status]?.label || status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    {/* Delivery address */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm text-slate-700">
                        {order.deliveryAddress}
                      </p>
                    </div>

                    {/* Items and total */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        {itemsCount} items
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {money(order.totalPrice)}
                      </span>
                    </div>

                    {/* Items list */}
                    {Array.isArray(order?.items) && order.items.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Items
                        </p>
                        <div className="space-y-2">
                          {order.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {it.foodName || `Item #${it.foodItemId}`}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {money(it.unitPrice)} × {it.quantity}
                                </p>
                              </div>
                              <span className="font-semibold text-slate-900 flex-shrink-0">
                                {money(
                                  (Number(it.unitPrice) || 0) *
                                    (Number(it.quantity) || 0)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-lg ring-1 ring-slate-200">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
