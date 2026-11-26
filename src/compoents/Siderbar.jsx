import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { HiX, HiChevronDown, HiChevronDoubleLeft } from "react-icons/hi";
import { RiShutDownLine } from "react-icons/ri";

import { NAV_SECTIONS } from "../config/routesConfig";

const pathMatches = (link, pathname) =>
  pathname === link || (link !== "/home" && pathname.startsWith(`${link}/`)) || pathname.startsWith(`${link}?`);

const BrandMark = () => (
  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-[#c99a2e]/30">
    <img src="/images/dvagoo.png" alt="Dvagoo" className="h-full w-full scale-[1.3] object-cover" />
  </div>
);

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

  // On mobile the drawer always shows labels; collapsing only applies on desktop
  const showLabels = open || mobileOpen;

  const itemBase = "group relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors";
  const itemIdle = "text-gray-400 hover:bg-white/[0.06] hover:text-gray-100";
  const itemActive = "bg-gradient-to-r from-[#c99a2e]/[0.16] to-white/[0.04] text-white ring-1 ring-inset ring-white/[0.06] before:absolute before:-left-3 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-[#c99a2e]";
  const iconClass = (active) => `shrink-0 ${active ? "text-[#c99a2e]" : "text-gray-500 group-hover:text-gray-300"}`;

  const renderLink = (item) => {
    const active = pathMatches(item.link, fullPath) || pathMatches(item.link, pathname);
    return (
      <Link
        key={item.link + item.name}
        to={item.link}
        onClick={onMobileClose}
        title={!showLabels ? item.name : undefined}
        className={`${itemBase} ${active ? itemActive : itemIdle} ${!showLabels ? "justify-center" : ""}`}
      >
        {item.icon && <item.icon size={18} className={iconClass(active)} />}
        {showLabels && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  const displayName = auth?.user?.userName || "Admin";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`glass-dark fixed inset-y-0 left-0 z-50 flex h-screen flex-col !bg-[#0e1016]/90 text-gray-300 transition-[width,transform] duration-200 ease-out lg:relative lg:m-3 lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 lg:rounded-2xl lg:!bg-[#0e1016]/55 ${
          open ? "w-[256px]" : "w-[256px] lg:w-[68px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div
          className={`flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] ${
            showLabels ? "px-4" : "justify-center"
          }`}
        >
          <BrandMark />
          {showLabels && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[15px] font-semibold text-white">Dvagoo</p>
              <p className="truncate text-xs text-[#c99a2e]/80">Admin Console</p>
            </div>
          )}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <HiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} className="mb-5 last:mb-2">
              {showLabels ? (
                <p className="mb-1.5 px-2.5 text-xs font-medium text-gray-500">{section.label}</p>
              ) : (
                <div className="mx-auto mb-3 h-px w-5 bg-white/10" />
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
                          onClick={() => {
                            if (showLabels) return toggleExpand(key);
                            // Collapsed rail: open the sidebar with this group expanded
                            setOpen(true);
                            setExpanded((prev) => ({ ...prev, [key]: true }));
                          }}
                          title={!showLabels ? item.name : undefined}
                          className={`${itemBase} ${isChildActive ? "text-white" : itemIdle} ${
                            !showLabels ? "justify-center" : ""
                          } ${isChildActive && !showLabels ? itemActive : ""}`}
                        >
                          <Icon size={18} className={iconClass(isChildActive)} />
                          {showLabels && (
                            <>
                              <span className="flex-1 truncate text-left">{item.name}</span>
                              <HiChevronDown
                                size={15}
                                className={`shrink-0 text-gray-500 transition-transform duration-150 ${
                                  expanded[key] ? "rotate-180" : ""
                                }`}
                              />
                            </>
                          )}
                        </button>
                        {showLabels && expanded[key] && (
                          <div className="ml-[19px] mt-0.5 space-y-0.5 border-l border-white/[0.08] pl-2.5">
                            {visibleChildren.map((child) => {
                              const active =
                                pathMatches(child.link, fullPath) || pathMatches(child.link, pathname);
                              return (
                                <Link
                                  key={child.link}
                                  to={child.link}
                                  onClick={onMobileClose}
                                  className={`relative flex items-center rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                                    active
                                      ? "bg-white/[0.08] font-medium text-white"
                                      : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-100"
                                  }`}
                                >
                                  {active && <span className="absolute -left-[11px] top-1.5 bottom-1.5 w-px bg-[#c99a2e]" />}
                                  <span className="truncate">{child.name}</span>
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
        <div className="shrink-0 space-y-1 border-t border-white/[0.06] p-3">
          {showLabels && auth?.user && (
            <div className="flex items-center gap-2.5 px-1.5 py-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c99a2e]/15 text-xs font-semibold text-[#e0b955] ring-1 ring-[#c99a2e]/30">
                {initials || "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-100">{displayName}</p>
                <p className="truncate text-xs text-gray-500">{auth.user.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-gray-100 ${
              !showLabels ? "justify-center" : ""
            }`}
          >
            <RiShutDownLine size={17} />
            {showLabels && <span>Logout</span>}
          </button>
        </div>

        <button
          type="button"
          className="absolute -right-3 top-[42px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-[#c99a2e]/40 bg-[#14171f] text-[#d9ae4a] shadow-lg transition-colors hover:text-white lg:flex"
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        >
          <HiChevronDoubleLeft size={12} className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
