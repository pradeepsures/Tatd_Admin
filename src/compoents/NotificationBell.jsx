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
      await fetch(`${BASE_URL}/api/admin/notifications/read-all`, {
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
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <MdNotifications size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <MdCheckCircle /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif, idx) => (
                  <div key={notif._id || idx} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notif.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 p-2 text-center">
             <span className="text-xs text-gray-400">Showing recent notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
