import React from "react";

const orders = [
  { id: "#4821", customer: "Alex Carter", total: "$64.00", items: 3, status: "In Kitchen", channel: "Delivery", eta: "12:45 PM" },
  { id: "#4819", customer: "Priya Singh", total: "$42.50", items: 2, status: "Ready", channel: "Pickup", eta: "12:38 PM" },
  { id: "#4816", customer: "Diego Alvarez", total: "$58.00", items: 4, status: "On the way", channel: "Delivery", eta: "12:22 PM" },
  { id: "#4811", customer: "Sarah Nguyen", total: "$33.00", items: 2, status: "Pending", channel: "Dine-in", eta: "12:05 PM" },
  { id: "#4807", customer: "Emi Tanaka", total: "$28.40", items: 2, status: "In Kitchen", channel: "Pickup", eta: "11:57 AM" },
  { id: "#4802", customer: "Noah Miles", total: "$76.10", items: 5, status: "Ready", channel: "Delivery", eta: "11:48 AM" },
];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  Ready: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "In Kitchen": "bg-sky-50 text-sky-700 ring-sky-100",
  "On the way": "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

const summary = [
  { label: "Open tickets", value: "18", desc: "Across all channels" },
  { label: "Avg. prep time", value: "11m", desc: "Last 20 orders" },
  { label: "Awaiting pickup", value: "7", desc: "Ready to handoff" },
];

const Orders = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        {summary.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {card.value}
            </p>
            <p className="text-xs text-slate-500">{card.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Orders
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Live queue
            </h2>
            <p className="text-sm text-slate-500">
              Dummy data to validate table and status chips.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500">
            New manual order
          </button>
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
            {orders.map((order) => (
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
                      statusStyles[order.status] || "bg-slate-100 text-slate-700 ring-slate-200"
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Orders;
