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
<<<<<<< HEAD

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", link: "/home", icon: MdOutlineDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        name: "Drivers",
        icon: MdOutlinePeople,
        children: [
          { name: "All Drivers", link: "/home/driver" },
          { name: "Pending Verification", link: "/home/driver?verified=pending" },
        ],
      },
      {
        name: "Fleet",
        icon: MdOutlineDirectionsCar,
        children: [
          { name: "All Vehicles", link: "/home/vehicle" },
        ],
      },
      {
        name: "Trips & Assign",
        icon: MdOutlineAssignment,
        children: [
          { name: "One-Way / Round-Trip", link: "/home/booking" },
          { name: "Hourly Trips", link: "/home/booking/hourly" },
          { name: "Outstation Trips", link: "/home/booking/outstation" },
          { name: "Weekly Trips", link: "/home/booking/weekly" },
          { name: "Monthly Trips", link: "/home/booking/monthly" },
          { name: "Pending Assignment", link: "/home/booking/pending" },
          { name: "Driver Cancel Requests", link: "/home/cancelrequest" },
          { name: "Trip Cancel Requests", link: "/home/trip-cancel-requests" },
        ],
      },
    ],
  },
  {
    label: "Customers",
    items: [
      { name: "App Users", link: "/home/users", icon: MdOutlinePerson },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Pricing", link: "/home/pricing", icon: MdOutlinePriceChange },
      { name: "Support", link: "/home/complaint", icon: MdOutlineSupportAgent },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        name: "Settings",
        icon: MdOutlineSettings,
        children: [
          { name: "My Profile", link: "/home/my-profile" },
          { name: "Roles & Permissions", link: "/home/role" },
          { name: "Global Config", link: "/home/appConfig" },
          { name: "Outstation Pricing", link: "/home/outstationPricing" },
          { name: "Feedback Tags", link: "/home/feedbackTags" },
          { name: "Cancel Reasons", link: "/home/cancellationReasons" },
          { name: "Banner", link: "/home/banner" },
          { name: "FAQ", link: "/home/FAQ" },
          { name: "Terms & Conditions", link: "/home/TermAndCondition" },
          { name: "Privacy Policy", link: "/home/PrivacyPolicy" },
          { name: "About Us", link: "/home/AboutUs" },
          { name: "Refund Policy", link: "/home/RefundPolicy" },
        ],
      },
    ],
  },
];

const pathMatches = (link, pathname) =>
  pathname === link || (link !== "/home" && pathname.startsWith(`${link}/`)) || pathname.startsWith(`${link}?`);

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const { logout, auth } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const fullPath = pathname + search;
=======
import { BsFillFuelPumpFill } from "react-icons/bs";
import { GiPunchingBag } from "react-icons/gi";
import { GiHumanTarget } from "react-icons/gi";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { GiFlowerStar } from "react-icons/gi";
import { MdRoomPreferences } from "react-icons/md";
const Sidebar = () => {
  // const { hasPermission } = useAuth();
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState({});

<<<<<<< HEAD
  useEffect(() => {
    const next = {};
    NAV_SECTIONS.forEach((section, si) => {
      section.items.forEach((item, ii) => {
        if (item.children?.some((c) => pathMatches(c.link, fullPath) || pathMatches(c.link, pathname))) {
          next[`${si}-${ii}`] = true;
=======
  const menus = [
    { name: "Dashboard", link: "/home", icon: MdOutlineDashboard },

    {
      name: "Driver",
      icon: GiHumanTarget,
      dropdownIcon: RiArrowDropDownLine,
      subMenus: [
        {
          name: "Master",
          link: "/home/driver",
          sectionName: "Driver",
        },
          {
          name: "Assigned Driver",
          link: "/home/assignedDriver",
          sectionName: "AssignedDriver",
        },
          {
          name: "Unassigned Driver",
          link: "/home/unassignedDriver",
          sectionName: "UnassignedDriver",
        },
        // {
        //   name: "Attendance",
        //   link: "/home/punches",
        //   sectionName: "Punches",
        // },
        // {
        //   name: "Today Attendance",
        //   link: "/home/punches/today-summary",
        //   sectionName: "PunchesTodaySummary",
        // },

      ],
    },

     {
      name: "Region Master",
      icon: GiFlowerStar,
      dropdownIcon: RiArrowDropDownLine,
      subMenus: [
        {
          name: "States",
          link: "/home/states",
          sectionName: "States",
        },
          {
          name: "Cities",
          link: "/home/Cities",
          sectionName: "Cities",
        },
      ],
    },

     {
      name: "Vehicle Preference",
      icon: MdRoomPreferences,
      dropdownIcon: RiArrowDropDownLine,
      subMenus: [
        {
          name: "Vehicle Preference",
          link: "/home/VehiclePreference",
          sectionName: "VehiclePreference",
        },
         {
          name: "Vehicle Preference Category",
          link: "/home/VehiclePreferenceCategory",
          sectionName: "VehiclePreferenceCategory",
        },
        {
          name: "Night Time",
          link: "/home/NightTimes",
          sectionName: "NightTime",
        },
      ],
    },

    
    {
      name: "Hourly Booking",
      icon: TbBrandBooking,
      dropdownIcon: RiArrowDropDownLine,
      subMenus: [
         {
          name: "Hourly Booking",
          link: "/home/hourlyBooking",
          sectionName: "HourlyBooking",
        },
      ],
    },

      //  {
      //     name: "Hourly Booking",
      //     link: "/home/hourlyBooking",
      //     icon: TbBrandBooking,
      //     sectionName: "HourlyBooking",
      //   },

    // {
    //   name: "Vehicle",
    //   icon: FaCar,
    //   dropdownIcon: RiArrowDropDownLine,
    //   subMenus: [
    //     {
    //       name: "Vehicle",
    //       link: "/home/vehicle",
    //       sectionName: "Vehicle",
    //     },
    //     // {
    //     //   name: "FuelLogs",
    //     //   link: "/home/fuelLogs",
    //     //   sectionName: "FuelLogs",
    //     // },

    //   ],
    // },

    // {
    //   name: "Pricing",
    //   link: "/home/pricing",
    //   icon: RiPriceTag2Line,
    //   sectionName: "Pricing",
    // },

    // {
    //   name: "Trip",
    //   icon: TbBrandBooking,
    //   dropdownIcon: RiArrowDropDownLine,
    //   subMenus: [
    //     {
    //       name: "All Trips",
    //       link: "/home/booking",
    //       sectionName: "Booking",
    //     },

    //     {
    //       name: "Vehicle Status Request",
    //       link: "/home/cancelRequest",
    //       sectionName: "CancelRequest",
    //     },
    //   ],
    // },

    // {
    //   name: "Support",
    //   link: "/home/complaint",
    //   icon: MdReportProblem,
    //   sectionName: "Complaint",
    // },

    // {
    //   name: "Shuttle",
    //   icon: FaSpaceShuttle,
    //   dropdownIcon: RiArrowDropDownLine,
    //   subMenus: [
    //     // 🔹 Retail submenu
    //     {
    //       name: "Retail",
    //       dropdownIcon: RiArrowDropDownLine,
    //       subMenus: [
    //         {
    //           name: "ShuttleRoute",
    //           link: "/home/shuttleRoutes",
    //           sectionName: "ShuttleRoute",
    //         },
    //         {
    //           name: "ShuttleRouteShift",
    //           link: "/home/shuttleRouteShifts",
    //           sectionName: "ShuttleRouteShift",
    //         },
    //         {
    //           name: "ShuttleRouteShiftAssign",
    //           link: "/home/shuttleRouteShiftAssign",
    //           sectionName: "ShuttleRouteShiftAssign",
    //         },
    //         {
    //           name: "ShuttlePass",
    //           link: "/home/shuttlePass",
    //           sectionName: "ShuttlePass",
    //         },
    //       ],
    //     },

    //     // 🔹 NEW ETS submenu
    //     {
    //       name: "ETS",
    //       dropdownIcon: RiArrowDropDownLine,
    //       subMenus: [
    //         {
    //           name: "Users",
    //           link: "/home/etsUser",
    //           sectionName: "EtsUsers",
    //         },
    //         {
    //           name: "Routes",
    //           link: "/home/etsRoutes",
    //           sectionName: "EtsRoutes",
    //         },
    //         {
    //           name: "RouteShifts",
    //           link: "/home/etsRouteShifts",
    //           sectionName: "EtsRouteShifts",
    //         },
    //         {
    //           name: "RouteShiftAssign",
    //           link: "/home/etsRouteShiftAssign",
    //           sectionName: "EtsRouteShiftAssign",
    //         },
    //         {
    //           name: "UserStopPages",
    //           link: "/home/etsUserStopPages",
    //           sectionName: "EtsUserStopPages",
    //         },
    //       ],
    //     },
    //   ],
    // },

    {
      name: "Settings",
      icon: MdOutlineSettingsSuggest,
      dropdownIcon: RiArrowDropDownLine,
      subMenus: [
        {
          name: "Member",
          link: "/home/member",
          sectionName: "Member",
        },
        // {
        //   name: "Section Master",
        //   link: "/home/memberMaster",
        //   sectionName: "SectionMaster",
        // },
        // {
        //   name: "Role",
        //   link: "/home/role",
        //   sectionName: "Role",
        // },
        // {
        //   name: "My Profile",
        //   link: "/home/my-profile",
        //   sectionName: "MyProfile",
        // },
        // {
        //   name: "Segment",
        //   link: "/home/segment",
        //   sectionName: "Segment",
        // },
        // {
        //   name: "Region",
        //   link: "/home/region",
        //   sectionName: "Region",
        // },
        // {
        //   name: "Platform Dependencies",
        //   link: "/home/platformdependencies",
        //   sectionName: "PlatformDependencies",
        // },
        // {
        //   name: "Holidays",
        //   link: "/home/holidays",
        //   sectionName: "Holidays",
        // },
        // {
        //   name: "Airport Regions",
        //   link: "/home/airportRegions",
        //   icon: MdOutlineAssignmentTurnedIn,
        //   sectionName: "AirportRegions",
        // },

        // {
        //   name: "Punch Region",
        //   link: "/home/punchRegion",
        //   icon: GiPunch,
        //   sectionName: "PunchRegion",
        // },

        {
          name: "Hourly Packages",
          link: "/home/hourlyPackages",
          icon: GiPunch,
          sectionName: "HourlyPackages",
        },

        {
          name: "Hourly Pricing",
          link: "/home/hourlyPricing",
          icon: GiPunch,
          sectionName: "HourlyPricing",
        },

        // {
        //   name: "CMS",
        //   icon: IoMdHome,
        //   dropdownIcon: RiArrowDropDownLine,
        //   subMenus: [
        //     { name: "Banner", link: "/home/banner", sectionName: "Banner" },
        //     {
        //       name: "Term And Conditions",
        //       link: "/home/TermAndCondition",
        //       sectionName: "Term And Condition",
        //     }, 
        //     {
        //       name: "Privacy Policy",
        //       link: "/home/PrivacyPolicy",
        //       sectionName: "PrivacyPolicy",
        //     },
        //     {
        //       name: "About Us",
        //       link: "/home/AboutUs",
        //       icon: FaBlog,
        //       sectionName: "AboutUs",
        //     },

        //     {
        //       name: "Refund Policy",
        //       link: "/home/RefundPolicy",
        //       icon: FaBlog,
        //       sectionName: "RefundPolicy",
        //     },

        //     {
        //       name: "FAQ",
        //       link: "/home/Faq",
        //       icon: FaBlog,
        //       sectionName: "Faq",
        //     },
        //   ],
        // },

      ],
    },
  ];

  // Filter menus and submenus by read permission
  // const filteredMenus = menus
  //   .map((menu) => {
  //     if (menu.subMenus) {
  //       const visibleSubs = menu.subMenus.filter(
  //         (sub) => !sub.sectionName || hasPermission(sub.sectionName, "read"),
  //       );
  //       if (visibleSubs.length === 0) return null; // hide menu if no visible submenu
  //       return { ...menu, subMenus: visibleSubs };
  //     } else {
  //       // If main menu has sectionName, check permission
  //       if (menu.sectionName && !hasPermission(menu.sectionName, "read"))
  //         return null;
  //       return menu;
  //     }
  //   })
  //   .filter(Boolean); // Remove nulls

  const filterMenu = (items) => {
    return items
      .map((item) => {
        // If has children → recurse
        if (item.subMenus) {
          const filteredChildren = filterMenu(item.subMenus);

          if (filteredChildren.length === 0) return null;

          return { ...item, subMenus: filteredChildren };
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64
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

<<<<<<< HEAD
  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
=======
  // const filteredMenus = filterMenu(menus);
  const filteredMenus = menus;

  const handleMenuClick = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
    setActiveSubMenu(null);
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64
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
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
          <img src="/images/tatd.png" alt="Tatd" className="h-9 w-9 shrink-0 object-contain brightness-0 invert" />
          {open && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Tatd Admin</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-slate-500">Control Panel</p>
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
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`;
                  const Icon = item.icon;

                  if (item.children) {
                    const isChildActive = item.children.some(
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
                            {item.children.map((child) => {
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
