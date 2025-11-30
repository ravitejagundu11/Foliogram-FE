import { useEffect, useState } from "react";
import { Bell, CheckCircle, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
  from_user?: {
    name: string;
    avatar?: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications (backend ready)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // const res = await fetch(`/api/notifications/${user_id}`);
        // const data = await res.json();
        // setNotifications(data.notifications);

        setTimeout(() => {
          setNotifications([
            {
              id: 1,
              message: "Your appointment with John Doe is confirmed.",
              created_at: "2 hours ago",
              is_read: false,
            },
            {
              id: 2,
              message: "A new blog post has been published.",
              created_at: "1 day ago",
              is_read: true,
            },
          ]);
          setLoading(false);
        }, 350);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Mark as read (backend ready)
  const markAsRead = async (id: number) => {
    try {
      // await fetch(`/api/notifications/${id}/read`, { method: "PUT" });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h1>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (
        <Card className="p-10 text-center shadow-sm">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium">No Notifications Yet</h2>
          <p className="text-gray-500 text-sm mt-1">
            You will see updates and alerts here.
          </p>
        </Card>
      )}

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`cursor-pointer transition-all shadow-sm hover:bg-gray-50 ${
              !n.is_read ? "border-blue-400" : ""
            }`}
            onClick={() => markAsRead(n.id)}
          >
            <CardContent className="p-4 flex items-start gap-3">

              {/* Simple avatar substitute */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                {n.from_user?.name?.[0] ?? "U"}
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm ${
                    n.is_read ? "text-gray-600" : "font-semibold"
                  }`}
                >
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{n.created_at}</p>
              </div>

              {!n.is_read ? (
                <Circle className="w-4 h-4 text-blue-500 mt-1" />
              ) : (
                <CheckCircle className="w-4 h-4 text-gray-400 mt-1" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
