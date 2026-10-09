"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  Radio,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationsAsRead,
} from "@/lib/notification-api";
import type { NotificationChannel, NotificationRecord } from "@/types/notification";

function getChannelIcon(channel: NotificationChannel) {
  switch (channel) {
    case "WHATSAPP":
      return <span className="text-emerald-600 font-bold text-[10px]">WA</span>;
    case "SMS":
      return <Smartphone size={13} className="text-blue-600" />;
    case "PUSH":
      return <Radio size={13} className="text-purple-600" />;
    case "IN_APP":
    default:
      return <Bell size={13} className="text-[#1b5e20]" />;
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 60000,
  });

  // Fetch recent in-app notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications-inbox-preview"],
    queryFn: () => listNotifications({ channel: "ALL" }),
    enabled: isOpen,
  });

  // Mark all as read mutation
  const markAllMutation = useMutation({
    mutationFn: () => markNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-inbox-preview"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  // Mark single as read
  const markSingleMutation = useMutation({
    mutationFn: (id: string) => markNotificationsAsRead([id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-inbox-preview"] });
    },
  });

  const handleNotificationClick = (item: NotificationRecord) => {
    if (item.status !== "READ") {
      markSingleMutation.mutate(item.id);
    }
    if (item.payload?.actionUrl) {
      setIsOpen(false);
      router.push(item.payload.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-md text-[#64766a] transition-colors hover:bg-[#f1f5f1] hover:text-[#1b5e20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b5e20]"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#dce5dd] bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eef2ef] bg-[#f8faf8] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#19392a]">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="text-[11px] font-medium text-[#1b5e20] hover:underline inline-flex items-center gap-1"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#87958b] hover:text-[#19392a] p-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f1f5f1]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#87958b]">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[#fafbfa] ${
                    item.status !== "READ" ? "bg-[#f4f8f4]/60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-[#19392a]">
                      <span className="inline-flex size-5 items-center justify-center rounded-sm bg-white border border-[#dce5dd]">
                        {getChannelIcon(item.channel)}
                      </span>
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                    {item.status !== "READ" && (
                      <span className="size-1.5 rounded-full bg-[#1b5e20] shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-[#64766a] line-clamp-2">{item.body}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#87958b]">
                    <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {item.payload?.actionUrl && (
                      <span className="inline-flex items-center gap-0.5 text-[#1b5e20] font-semibold hover:underline">
                        View Details <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#eef2ef] bg-[#f8faf8] p-2.5 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#1b5e20] hover:underline"
            >
              Open Notification Center & Logs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

