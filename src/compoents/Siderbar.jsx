// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdHome } from "react-icons/io";
import { FaBlog } from "react-icons/fa6";
import { TbZodiacTaurus } from "react-icons/tb";
import { LiaStreetViewSolid } from "react-icons/lia";
import { FaUserShield } from "react-icons/fa6";
import { ImUserPlus } from "react-icons/im";
import { BiRupee } from "react-icons/bi";
import { TbTransactionRupee } from "react-icons/tb";
import { FaImage } from "react-icons/fa";
import { FaHandshakeSimple } from "react-icons/fa6";
import { MdProductionQuantityLimits } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { AiOutlineTransaction } from "react-icons/ai";
import { PiHandsPrayingFill } from "react-icons/pi";
import { GrTransaction } from "react-icons/gr";
import { TbZodiacAries } from "react-icons/tb";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { IoSettings } from "react-icons/io5";
import { CiChat2 } from "react-icons/ci";
import { PiTrainRegionalLight } from "react-icons/pi";
import { RiPriceTag2Line } from "react-icons/ri";
import { FaCar } from "react-icons/fa";
import { GrUserManager } from "react-icons/gr";
import { TbBrandBooking } from "react-icons/tb";
import { SiGooglemarketingplatform } from "react-icons/si";
import { MdReportProblem } from "react-icons/md";
import { MdOutlineHolidayVillage } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { RiRouterLine } from "react-icons/ri";
import { DiOpenshift } from "react-icons/di";
import { MdOutlineAssignmentReturned } from "react-icons/md";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { GiPunch } from "react-icons/gi";
import { RiPagesLine } from "react-icons/ri";
import { FaSpaceShuttle } from "react-icons/fa";
import { MdOutlineShutterSpeed } from "react-icons/md";
import { TbRouteScan } from "react-icons/tb";
import { RiShutDownFill } from "react-icons/ri";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { GiPunchingBag } from "react-icons/gi";
import { GiHumanTarget } from "react-icons/gi";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { GiFlowerStar } from "react-icons/gi";
import { MdRoomPreferences } from "react-icons/md";
const Sidebar = () => {
  // const { hasPermission } = useAuth();
  const [open, setOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

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
        }

        // If leaf node → check permission
        if (item.sectionName) {
          return hasPermission(item.sectionName, "read") ? item : null;
        }

        return item;
      })
      .filter(Boolean);
  };

  // const filteredMenus = filterMenu(menus);
  const filteredMenus = menus;

  const handleMenuClick = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
    setActiveSubMenu(null);
  };

  const handleSubMenuClick = (index, subIndex) => {
    const key = `${index}-${subIndex}`;
    setActiveSubMenu(activeSubMenu === key ? null : key);
    setActiveMenu(index);
  };
  // const handleSubMenuClick = (index, subIndex) => {
  //   setActiveSubMenu(subIndex === activeSubMenu ? null : subIndex);
  //   setActiveMenu(index);
  // };

  // bg-gradient-to-t from-[#DD2630] to-[#800303]

  return (
    <div>
      <section className="flex ">
        <div className="relative  ">
          {/* Sidebar */}
          <div
            className={`bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6] h-screen ${open ? "w-[260px]" : "w-16"
              } duration-500 text-gray-100 px-4 flex flex-col`}
          >
            {/* Logo */}
            <div className="flex flex-col items-center justify-center py-1 mt-2 mr-12 overflow-hidden">
              <img
                src="/images/tatd.png"
                alt="Logo"
                className={`rounded-full object-contain transition-all duration-500 brightness-0 invert ${open ? "w-28" : "w-8"
                  }`}
              />
              <h1
                className={`mt-3 text-center font-bold text-lg bg-opacity-20 backdrop-blur-md px-4 py-1 rounded-lg shadow-md text-white transform transition-all duration-900 ${open
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-40 opacity-0"
                  }`}
              >
                <span className="text-[#FB8500]">Tatd</span>
              </h1>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-scroll sidebar-scroll pr-2">
              <div className="mt-3 pb-5 flex flex-col gap-2.5 relative">
                {filteredMenus.map((menu, index) => (
                  <div key={index}>
                    {menu.subMenus ? (
                      <div
                        className={`group flex items-center justify-between text-sm gap-3.5 font-medium p-2 rounded-md cursor-pointer ${activeMenu === index

                          ? "bg-[#070708]"
                          : "hover:bg-gray-900"
                          }`}
                        onClick={() => handleMenuClick(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            {React.createElement(menu.icon, { size: "20" })}
                          </div>
                          <h2
                            style={{ transitionDelay: `${index + 3}00ms` }}
                            className={`whitespace-pre duration-500 ${!open &&
                              "opacity-0 translate-x-28 overflow-hidden"
                              }`}
                          >
                            {menu.name}
                          </h2>
                        </div>

                        {open && menu.dropdownIcon && (
                          <menu.dropdownIcon
                            size={24}
                            className={`text-white transition-transform duration-300 ${activeMenu === index ? "rotate-180" : "rotate-0"
                              }`}
                          />
                        )}

                        <h2
                          className={`${open && "hidden"
                            } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}
                        >
                          {menu.name}
                        </h2>
                      </div>
                    ) : (
                      <Link
                        to={menu.link}
                        className={`group flex items-center text-sm gap-3.5 font-medium p-2 rounded-md ${activeMenu === index

                          ? "bg-[#090908]"

                          : "hover:bg-gray-900"
                          }`}
                        onClick={() => setActiveMenu(index)}
                      >
                        <div>
                          {React.createElement(menu.icon, { size: "20" })}
                        </div>
                        <h2
                          style={{ transitionDelay: `${index + 3}00ms` }}
                          className={`whitespace-pre duration-500 ${!open && "opacity-0 translate-x-28 overflow-hidden"
                            }`}
                        >
                          {menu.name}
                        </h2>

                        <h2
                          className={`${open && "hidden"
                            } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}
                        >
                          {menu.name}
                        </h2>
                      </Link>
                    )}

                    {/* Submenus */}
                    {menu.subMenus && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ${activeMenu === index ? "max-h-[500px]" : "max-h-0"
                          }`}
                      >
                        {/* {menu.subMenus.map((subMenu, subIndex) => (
                          <Link
                            to={subMenu.link}
                            key={subIndex}
                            className={`flex items-center gap-3 text-sm py-1.5 pl-9 pr-4 cursor-pointer rounded-md transition-colors duration-200 relative
      `}
                            onClick={() => handleSubMenuClick(index, subIndex)}
                          >
                           
                            {activeSubMenu === subIndex && (
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></span>
                            )}
                            {subMenu.name}
                          </Link>
                        ))} */}
                        {menu.subMenus.map((subMenu, subIndex) => (
                          <div key={subIndex}>
                            {/* 🔹 If submenu has children */}
                            {subMenu.subMenus ? (
                              <>
                                <div
                                  className="flex items-center justify-between text-sm py-1.5 pl-9 pr-4 cursor-pointer hover:bg-gray-800 rounded-md"
                                  onClick={() => handleSubMenuClick(index, subIndex)}
                                >
                                  {subMenu.name}

                                  {subMenu.dropdownIcon && (
                                    <subMenu.dropdownIcon
                                      className={`transition-transform ${activeSubMenu === `${index}-${subIndex}` ? "rotate-180" : ""
                                        }`}
                                    />
                                  )}
                                </div>

                                {/* 🔽 Nested submenu */}
                                <div
                                  className={`overflow-hidden transition-all duration-300 ${activeSubMenu === `${index}-${subIndex}` ? "max-h-96" : "max-h-0"
                                    }`}
                                >
                                  {subMenu.subMenus.map((child, childIndex) => (
                                    <Link
                                      to={child.link}
                                      key={childIndex}
                                      onClick={() => setActiveItem(child.link)}
                                      className="relative block text-sm py-1.5 pl-14 pr-4 hover:bg-gray-800 rounded-md"
                                    >
                                      {/* 🔴 DOT */}
                                      {activeItem === child.link && (
                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></span>
                                      )}

                                      {child.name}
                                    </Link>
                                    // <Link
                                    //   to={child.link}
                                    //   key={childIndex}
                                    //   className="block text-sm py-1.5 pl-14 pr-4 hover:bg-gray-800 rounded-md"
                                    // >
                                    //   {child.name}
                                    // </Link>
                                  ))}
                                </div>
                              </>
                            ) : (
                              /* 🔹 Normal submenu */
                              <Link
                                to={subMenu.link}
                                onClick={() => setActiveItem(subMenu.link)}
                                className="relative block text-sm py-1.5 pl-9 pr-4 hover:bg-gray-800 rounded-md"
                              >
                                {activeItem === subMenu.link && (
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></span>
                                )}

                                {subMenu.name}
                              </Link>
                              // <Link
                              //   to={subMenu.link}
                              //   className="block text-sm py-1.5 pl-9 pr-4 hover:bg-gray-800 rounded-md"
                              //   onClick={() => handleSubMenuClick(index, subIndex)}
                              // >
                              //   {subMenu.name}
                              // </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Button */}
            <HiMenuAlt3
              size={26}
              className="absolute top-15 right-4 hover:bg-amber-700 size-8 text-white rounded-full p-1 cursor-pointer"
              onClick={() => {
                setOpen(!open);
                setActiveMenu(null); // Close the menu when toggling the sidebar
              }}
            />
          </div>
        </div>

        {/* Main Content placeholder */}
        <section className="w-full">{/* children or main content */}</section>
      </section>
    </div>
  );
};

export default Sidebar;
