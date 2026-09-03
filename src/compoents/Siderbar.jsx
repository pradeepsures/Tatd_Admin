import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import {
  MdOutlineDashboard,
  MdOutlinePeople,
  MdOutlineDirectionsCar,
  MdOutlineAssignment,
  MdOutlinePriceChange,
  MdOutlineSupportAgent,
  MdOutlineSettings,
  MdOutlinePerson,
  MdOutlineCancel,
  MdOutlinePendingActions,
} from "react-icons/md";
import { RiShutDownFill } from "react-icons/ri";

import { NAV_SECTIONS } from "../config/routesConfig";

const pathMatches = (link, pathname) =>
  pathname === link || (link !== "/home" && pathname.startsWith(`${link}/`)) || pathname.startsWith(`${link}?`);

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const { logout, auth, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const fullPath = pathname + search;
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const next = {};
    NAV_SECTIONS.forEach((section, si) => {
      section.items.forEach((item, ii) => {
        if (item.children?.some((c) => pathMatches(c.link, fullPath) || pathMatches(c.link, pathname))) {
          next[`${si}-${ii}`] = true;
        }
      });
    });
    setExpanded((prev) => ({ ...prev, ...next }));
  }, [pathname, search]);

  const handleLogout = () => {
    logout();
    onMobileClose?.();
    navigate("/login", { replace: true });
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderLink = (item, className = "") => {
    const active = pathMatches(item.link, fullPath) || pathMatches(item.link, pathname);
    return (
      <Link
        key={item.link + item.name}
        to={item.link}
        onClick={onMobileClose}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${className} ${
          active
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        {item.icon && <item.icon size={20} className="shrink-0" />}
        {open && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[#111827] border-r border-slate-800 text-slate-300 transition-all duration-300 lg:relative lg:translate-x-0 ${
          open ? "w-[260px]" : "w-[72px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center gap-4 border-b border-slate-800 px-5">
          <img src="/images/dvagoo.png" alt="Dvagoo" className="h-12 w-12 md:h-14 md:w-14 shrink-0 object-contain rounded-xl shadow-md" />
          {open && (
            <div className="min-w-0 flex flex-col justify-center">
              <p className="truncate text-base md:text-lg font-bold text-white tracking-wide">Dvagoo Admin</p>
              <p className="truncate text-xs uppercase tracking-wider text-slate-400 font-medium mt-0.5">Control Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <HiX size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} className="mb-5">
              {open && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items
                  .filter((item) => !item.permissionKey || hasPermission(item.permissionKey, "read"))
                  .map((item, ii) => {
                  const key = `${si}-${ii}`;
                  const Icon = item.icon;

                  if (item.children) {
                    const visibleChildren = item.children.filter((child) => !child.permissionKey || hasPermission(child.permissionKey, "read"));
                    if (visibleChildren.length === 0) return null;

                    const isChildActive = visibleChildren.some(
                      (c) => pathMatches(c.link, fullPath) || pathMatches(c.link, pathname)
                    );
                    return (
                      <div key={item.name}>
                        <button
                          type="button"
                          onClick={() => toggleExpand(key)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isChildActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Icon size={20} className="shrink-0" />
                          {open && (
                            <>
                              <span className="flex-1 text-left truncate">{item.name}</span>
                              <span className={`text-xs transition-transform ${expanded[key] ? "rotate-180" : ""}`}>▼</span>
                            </>
                          )}
                        </button>
                        {open && expanded[key] && (
                          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700 pl-2">
                            {visibleChildren.map((child) => {
                              const active =
                                pathMatches(child.link, fullPath) || pathMatches(child.link, pathname);
                              return (
                                <Link
                                  key={child.link}
                                  to={child.link}
                                  onClick={onMobileClose}
                                  className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                                    active
                                      ? "bg-blue-600/90 text-white font-medium"
                                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return renderLink(item);
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 p-3 space-y-2">
          {open && auth?.user && (
            <div className="rounded-lg bg-slate-800/60 px-3 py-2">
              <p className="truncate text-xs text-slate-400">{auth.user.email}</p>
              <p className="truncate text-sm font-medium text-white">{auth.user.userName || "Admin"}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <RiShutDownFill size={18} />
            {open && <span>Logout</span>}
          </button>
        </div>

        <button
          type="button"
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#111827] text-slate-400 hover:text-white lg:flex"
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        >
          <HiMenuAlt3 size={14} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
