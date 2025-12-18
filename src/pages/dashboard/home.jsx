import React from "react";

const stats = [
  { title: "Today's Orders", value: "182", change: "+14% vs yesterday" },
  { title: "Revenue", value: "$12,480", change: "Daily run rate" },
  { title: "Prep Time", value: "11m", change: "2m faster than avg" },
  { title: "New Users", value: "36", change: "Sign-ups today" },
];

const loadMap = [
  { label: "Dine-in", value: 38 },
  { label: "Delivery", value: 44 },
  { label: "Pickup", value: 18 },
];

const topProducts = [
  { name: "Truffle Pasta", category: "Mains", tickets: 42, revenue: "$756" },
  {
    name: "Matcha Cheesecake",
    category: "Dessert",
    tickets: 31,
    revenue: "$285",
  },
  {
    name: "Citrus Cooler",
    category: "Beverages",
    tickets: 28,
    revenue: "$196",
  },
];

const alerts = [
  {
    title: "Delivery zone B",
    desc: "Riders slowed by rain. Add 4 minutes buffer.",
    tone: "text-amber-600",
  },
  {
    title: "Low stock",
    desc: "Charcoal buns and basil pesto running below 12 units.",
    tone: "text-rose-600",
  },
  {
    title: "Great reviews",
    desc: "4.9⭐ rating in the last 50 deliveries.",
    tone: "text-emerald-600",
  },
];

const Home = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <p className="text-xs text-slate-500">{card.change}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Live overview
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Service health
              </h2>
              <p className="text-sm text-slate-500">
                Orders flowing smoothly across dining, pickup, and delivery.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Auto-sync enabled
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "In kitchen",
                value: 28,
                tone: "text-sky-700",
                bg: "bg-sky-50",
                ring: "ring-sky-100",
              },
              {
                label: "Ready to pick",
                value: 12,
                tone: "text-emerald-700",
                bg: "bg-emerald-50",
                ring: "ring-emerald-100",
              },
              {
                label: "On the way",
                value: 9,
                tone: "text-amber-700",
                bg: "bg-amber-50",
                ring: "ring-amber-100",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl ${item.bg} px-4 py-3 ${item.ring} ring-1`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {item.label}
                </p>
                <p className={`text-2xl font-semibold ${item.tone}`}>
                  {item.value}
                </p>
                <p className="text-xs text-slate-500">Orders in queue</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Order mix
                </p>
                <span className="text-xs text-slate-500">Today</span>
              </div>
              <div className="space-y-3">
                {loadMap.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-sky-400 to-indigo-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Highlights
                </p>
                <span className="text-xs text-slate-500">Last 2 hours</span>
              </div>
              <div className="space-y-3">
                {alerts.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <p className={`text-sm font-semibold ${item.tone}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Trending menu
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Top products
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Updated hourly
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {topProducts.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {item.tickets} tickets
                  </span>
                  <p className="font-semibold text-slate-900">{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Service quality
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Order timeline
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Last 90 mins
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              "Prep time stable at 11m per order.",
              "Delivery partners within 3 km getting assigned in 90s.",
              "Front of house clearing tables in under 6m.",
            ].map((note) => (
              <div
                key={note}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {note}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Quick actions
              </p>
              <h3 className="text-lg font-semibold text-slate-900">Workflow</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Healthy queue
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Pause delivery slots",
                desc: "Stop accepting deliveries for 15 minutes.",
              },
              {
                title: "Promote desserts",
                desc: "Highlight tiramisu for dinner rush.",
              },
              {
                title: "Print prep sheet",
                desc: "Hand kitchen the latest order queue.",
              },
            ].map((action) => (
              <div
                key={action.title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {action.title}
                </p>
                <p className="text-xs text-slate-600">{action.desc}</p>
                <button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-600">
                  Run action
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 5 7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
