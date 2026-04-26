"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  bookingId: string;
};

export default function TechnicianDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/technician/notifications", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/technician/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-neutral-100">Technician Dashboard</h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Your Notifications</h2>
          {loading ? (
            <p className="text-neutral-400">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="bg-neutral-900/50 rounded-xl p-8 text-center border border-neutral-800">
              <p className="text-neutral-400">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${
                    n.read 
                      ? "bg-neutral-900/50 border-neutral-800 opacity-70" 
                      : "bg-emerald-950/20 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      <p className={`font-medium ${n.read ? "text-neutral-300" : "text-white"}`}>
                        {n.message}
                      </p>
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center gap-4">
                      <span>Booking ID: <span className="text-neutral-400 font-mono">{n.bookingId}</span></span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors border border-neutral-700 hover:border-neutral-600 whitespace-nowrap"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
            <h2 className="text-xl font-semibold mb-4 text-neutral-100">Assigned Jobs</h2>
            <p className="text-neutral-400 text-sm">
              Jobs assignment view is synced directly from your admin coordinator. When assigned a job, check your notifications above.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
