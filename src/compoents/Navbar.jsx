import React, { useMemo } from 'react'
import { useLocation } from "react-router-dom";
import Profilelogo from "./Profilelogo"
import NotificationBell from "./NotificationBell"
import { HiMenuAlt2 } from "react-icons/hi";
import { useAuth } from "../auth/AuthContext";
import { NAV_SECTIONS } from "../config/routesConfig";

// Find a friendly title for the current route from the sidebar config
const useRouteTitle = () => {
  const { pathname, search } = useLocation();
  return useMemo(() => {
    const full = pathname + search;
    let best = null;
    const consider = (name, link, section) => {
      if (!link) return;
      const hit = full === link || pathname === link || (link !== "/home" && (pathname.startsWith(`${link}/`) || full.startsWith(`${link}?`)));
      if (hit && (!best || link.length > best.link.length)) best = { name, link, section };
    };
    NAV_SECTIONS.forEach((section) =>
      section.items.forEach((item) => {
        consider(item.name, item.link, section.label);
        item.children?.forEach((c) => consider(c.name, c.link, section.label));
      })
    );
    if (best) return best;
    const last = pathname.split("/").filter(Boolean).pop() || "home";
    return { name: last.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"), section: null };
  }, [pathname, search]);
};

const Navbar = ({ onMenuClick }) => {
  const { auth } = useAuth();
  const displayName = auth?.user?.userName || auth?.user?.email?.split("@")[0] || "Admin";
  const route = useRouteTitle();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="glass-dark relative z-30 flex h-14 w-full shrink-0 items-center justify-between rounded-2xl px-3 text-white sm:h-[60px] sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <HiMenuAlt2 size={20} />
        </button>
        <div className="min-w-0 leading-tight">
          {route.section && (
            <p className="hidden truncate text-xs text-gray-400 sm:block">{route.section}</p>
          )}
          <p className="truncate text-[15px] font-semibold capitalize text-white sm:text-base">{route.name}</p>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1.5 sm:gap-3'>
        <span className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-300 md:inline-block">
          {today}
        </span>
        <NotificationBell />
        <div className="hidden h-7 w-px bg-white/10 sm:block"></div>
        <div className="hidden min-w-0 text-right leading-tight sm:block">
          <p className="max-w-[160px] truncate text-sm font-medium text-white">{displayName}</p>
          {auth?.user?.role?.name && (
            <p className="max-w-[160px] truncate text-xs text-[#d9ae4a]">{auth.user.role.name}</p>
          )}
        </div>
        <Profilelogo />
      </div>
    </header>
  );
};

export default Navbar;
