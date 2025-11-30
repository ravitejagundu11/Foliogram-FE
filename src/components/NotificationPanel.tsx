"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";

interface Notification {
  id: string;
  message: string;
  time: string;
  image?: string;
  isRead: boolean;
}

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ---------------------------
  // MOCK DATA (FALLBACK)
  // ---------------------------
  const mockNotifications: Notification[] = [
    { id: "1", message: "New appointment booked by John Doe", time: "2h ago", image: "/image/notifications.png", isRead: false },
    { id: "2", message: "Your folio was viewed by a recruiter", time: "5h ago", image: "/image/notifications.png", isRead: true },
    { id: "3", message: "New message from HR", time: "1d ago", image: "/image/notifications.png", isRead: true },
  ];

  useEffect(() => {
    async function fetchNotifications() {
      try {
        /*
        const res = await fetch(`/api/notifications/${user_id}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const json = await res.json();
        setNotifications(json.notifications);
        return;
        */
        console.warn("Backend disabled → using mock notifications");
        setNotifications(mockNotifications);
      } catch (err) {
        console.warn("Error → using mock notifications");
        setNotifications(mockNotifications);
      }
    }

    fetchNotifications();

    // ---------------------------
    // POLLING FOR REAL-TIME EVENTS
    // ---------------------------
    const interval = setInterval(() => {
      const newNoti: Notification = {
        id: Date.now().toString(),
        message: "New booking received!",
        time: "just now",
        image: "/images/notifications.png",
        isRead: false,
      };

      showToast("🔔 New booking received!");
      setNotifications((prev) => [newNoti, ...prev]);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // SIMPLE BUILT-IN TOAST
  // ---------------------------
  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  // ---------------------------
  // CLOSE ON CLICK OUTSIDE
  // ---------------------------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------
  // MARK NOTIFICATION AS READ
  // ---------------------------
  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    /*
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
    */
  }

  return (
    <>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Dropdown Panel */}
      <Card
        ref={panelRef}
        className="absolute right-0 mt-3 w-80 shadow-xl rounded-xl border bg-white z-50 animate-fade-in"
      >
        <CardContent className="p-0">
          <h2 className="text-lg font-semibold p-3 border-b">Notifications</h2>

          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No notifications</p>
          ) : (
            <div className="max-h-80 overflow-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-gray-100 border-b ${!n.isRead ? "bg-blue-50" : ""}`}
                >
                  <img
                    src={n.image || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.message}</p>
                    <span className="text-xs text-gray-500">{n.time}</span>
                  </div>

                  {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
