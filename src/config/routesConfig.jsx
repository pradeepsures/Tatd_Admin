import {
  MdOutlineDashboard,
  MdOutlinePeople,
  MdOutlineDirectionsCar,
  MdOutlineAssignment,
  MdOutlinePriceChange,
  MdOutlineSupportAgent,
  MdOutlineSettings,
  MdOutlinePerson,
} from "react-icons/md";
import { 
  FaMapMarkedAlt, 
  FaRoute, 
  FaBus, 
  FaRegClock, 
  FaRegBuilding, 
  FaCity 
} from "react-icons/fa";

export const NAV_SECTIONS = [
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
          { name: "Vehicle Preferences", link: "/home/VehiclePreference" },
          { name: "Preference Categories", link: "/home/VehiclePreferenceCategory" },
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
          { name: "Driver Cancel Requests", link: "/home/cancelrequest" },
          { name: "Trip Cancel Requests", link: "/home/trip-cancel-requests" },
        ],
      },

    ],
  },
  {
    label: "Customers & Staff",
    items: [
      { name: "App Users", link: "/home/users", icon: MdOutlinePerson },
      { name: "Membership Plans", link: "/home/membership", icon: MdOutlinePeople },
    ],
  },
  {
    label: "Business & Pricing",
    items: [
      {
        name: "Pricing Config",
        icon: MdOutlinePriceChange,
        children: [
          { name: "Standard Pricing", link: "/home/pricing" },
          { name: "Hourly Pricing", link: "/home/hourlyPricing" },
          { name: "Weekly Pricing", link: "/home/weeklyPricing" },
          { name: "Monthly Pricing", link: "/home/monthlyPricing" },
          { name: "Outstation Pricing", link: "/home/outstationPricing" },
          { name: "Hourly Packages", link: "/home/hourlyPackages" },
        ],
      },
      { name: "Support & Complaints", link: "/home/complaint", icon: MdOutlineSupportAgent },
    ],
  },
  {
    label: "Geography & Locations",
    items: [
      {
        name: "Regions & Zones",
        icon: FaMapMarkedAlt,
        children: [
          { name: "States", link: "/home/states" },
          { name: "Cities", link: "/home/Cities" },
          { name: "Regions", link: "/home/region" },
        ],
      },
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
          { name: "Feedback Tags", link: "/home/feedbackTags" },
          { name: "Cancel Reasons", link: "/home/cancellationReasons" },
          { name: "Banners", link: "/home/banner" },
          { name: "Segments", link: "/home/segment" },
          { name: "Night Times", link: "/home/NightTimes" },
        ],
      },
      {
        name: "CMS",
        icon: FaRegBuilding,
        children: [
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

export const MODULE_CONFIGS = {
  etsRoutes: {
    title: "ETS Route",
    endpoint: "/api/admin/etsRoute",
    basePath: "/home/ets/routes",
    permissions: "ETS Route",
    columns: [
      { label: "Route Name", key: "name" },
      { label: "Origin", key: "origin" },
      { label: "Destination", key: "destination" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "Route Name", key: "name", required: true, fullWidth: true },
      { label: "Origin", key: "origin", required: true },
      { label: "Destination", key: "destination", required: true },
      { label: "Status", key: "status", type: "boolean" }
    ]
  },
  faq: {
    title: "FAQ",
    endpoint: "/api/admin/faq",
    basePath: "/home/FAQ",
    permissions: "FAQ",
    columns: [
      { label: "Question", key: "question" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "Question", key: "question", required: true, fullWidth: true },
      { label: "Answer", key: "answer", required: true, type: "textarea", fullWidth: true },
      { label: "Status", key: "status", type: "boolean" }
    ]
  },
  banner: {
    title: "Banner",
    endpoint: "/api/admin/banner",
    basePath: "/home/banner",
    permissions: "Banner",
    columns: [
      { label: "Image", key: "image", type: "image" },
      { label: "Priority", key: "priority" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "Banner Image", key: "image", type: "file", required: true, fullWidth: true },
      { label: "Priority", key: "priority", required: true },
      { label: "Status", key: "status", type: "boolean" }
    ]
  },
  states: {
    title: "State",
    endpoint: "/api/admin/states",
    basePath: "/home/states",
    permissions: "State",
    columns: [
      { label: "State Name", key: "name" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "State Name", key: "name", required: true, type: "state_select", fullWidth: true },
      { label: "Status", key: "status", type: "boolean" }
    ]
  },
  cities: {
    title: "City",
    endpoint: "/api/admin/cities",
    basePath: "/home/Cities",
    permissions: "City",
    columns: [
      { label: "City Name", key: "name" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true },
      { label: "City Name", key: "name", required: true, fullWidth: true },
      { label: "Status", key: "status", type: "boolean" }
    ]
  },
  hourlyPricing: {
    title: "Hourly Pricing",
    endpoint: "/api/admin/hourlyPricing",
    basePath: "/home/hourlyPricing",
    permissions: "HourlyPricing",
    columns: [
      { label: "State", key: "state.name" },
      { label: "City", key: "city.name" },
      { label: "Night Fare (₹)", key: "nightFare" },
      { label: "Round Trip (₹)", key: "roundTripFare" },
      { label: "One Way (₹)", key: "oneWayFare" },
      { label: "GST (%)", key: "gstPercent" },
      { label: "Status", key: "isActive", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      { label: "Night Fare", key: "nightFare", required: true, type: "number" },
      { label: "Round Trip Fare", key: "roundTripFare", required: true, type: "number" },
      { label: "One Way Fare", key: "oneWayFare", required: true, type: "number" },
      { label: "GST %", key: "gstPercent", required: true, type: "number" },
      { label: "Status", key: "isActive", type: "boolean" }
    ]
  },
  weeklyPricing: {
    title: "Weekly Pricing",
    endpoint: "/api/admin/weeklyPricing",
    basePath: "/home/weeklyPricing",
    permissions: "WeeklyPricing",
    columns: [
      { label: "State", key: "state.name" },
      { label: "City", key: "city.name" },
      { label: "Hourly Fare (₹)", key: "hourlyFare" },
      { label: "Night Fare (₹)", key: "nightFare" },
      { label: "Service Charge (₹)", key: "serviceCharge" },
      { label: "GST (%)", key: "gstPercent" },
      { label: "Status", key: "isActive", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      { label: "Hourly Fare", key: "hourlyFare", required: true, type: "number" },
      { label: "Night Fare", key: "nightFare", required: true, type: "number" },
      { label: "Service Charge", key: "serviceCharge", required: true, type: "number" },
      { label: "GST %", key: "gstPercent", required: true, type: "number" },
      { label: "Status", key: "isActive", type: "boolean" }
    ]
  },
  monthlyPricing: {
    title: "Monthly Pricing",
    endpoint: "/api/admin/monthlyPricing",
    basePath: "/home/monthlyPricing",
    permissions: "MonthlyPricing",
    columns: [
      { label: "State", key: "state.name" },
      { label: "City", key: "city.name" },
      { label: "Hourly Fare (₹)", key: "hourlyFare" },
      { label: "Night Fare (₹)", key: "nightFare" },
      { label: "GST (%)", key: "gstPercent" },
      { label: "Status", key: "isActive", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      { label: "Hourly Fare", key: "hourlyFare", required: true, type: "number" },
      { label: "Night Fare", key: "nightFare", required: true, type: "number" },
      { label: "GST %", key: "gstPercent", required: true, type: "number" },
      { label: "Status", key: "isActive", type: "boolean" }
    ]
  },
  outstationPricing: {
    title: "Outstation Pricing",
    endpoint: "/api/admin/outstationPricing",
    basePath: "/home/outstationPricing",
    permissions: "OutstationPricing",
    columns: [
      { label: "State", key: "state.name" },
      { label: "City", key: "city.name" },
      { label: "Round Trip/Day (₹)", key: "roundTripPerDayFare" },
      { label: "One Way/Km (₹)", key: "oneWayPerKmRate" },
      { label: "Night Fare (₹)", key: "nightFare" },
      { label: "Status", key: "isActive", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      { label: "Round Trip Per Day Fare", key: "roundTripPerDayFare", required: true, type: "number" },
      { label: "One Way Per Km Rate", key: "oneWayPerKmRate", required: true, type: "number" },
      { label: "One Way Base Fare", key: "oneWayBaseFare", required: true, type: "number" },
      { label: "Night Fare", key: "nightFare", required: true, type: "number" },
      { label: "Service Charge", key: "serviceCharge", required: true, type: "number" },
      { label: "GST %", key: "gstPercent", required: true, type: "number" },
      { label: "Status", key: "isActive", type: "boolean" }
    ]
  },
  hourlyPackages: {
    title: "Hourly Package",
    endpoint: "/api/admin/hourlyPackage",
    basePath: "/home/hourlyPackages",
    permissions: "HourlyPackages",
    columns: [
      { label: "Name", key: "name" },
      { label: "Hours", key: "hours" },
      { label: "Included KMs", key: "includedKms" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "Package Name", key: "name", required: true, fullWidth: true },
      { label: "Hours", key: "hours", required: true, type: "number" },
      { label: "Included KMs", key: "includedKms", required: true, type: "number" },
      { label: "Status", key: "status", type: "boolean" }
    ]
  }
};
