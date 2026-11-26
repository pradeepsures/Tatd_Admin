import React, { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdCheckCircle } from 'react-icons/md';
import { eventBus } from '../utils/eventBus';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    eventBus.on("new_notification", handleNewNotification);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      eventBus.off("new_notification", handleNewNotification);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/admin/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opened (or keep it explicit via a button)
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus:outline-none ${
          isOpen ? "bg-white/15 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <MdNotifications size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white ring-2 ring-[#14171f]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-[380px] origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <MdCheckCircle /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif, idx) => (
                  <div
                    key={notif._id || idx}
                    className={`relative px-4 py-3 transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                  >
                    {!notif.isRead && (
                      <span className="absolute left-1.5 top-[18px] h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <span className="ml-2 whitespace-nowrap text-xs text-gray-400">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[13px] text-gray-600">{notif.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 p-2.5 text-center">
            <span className="text-xs text-gray-400">Showing recent notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
