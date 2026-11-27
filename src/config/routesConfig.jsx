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
      { name: "Dashboard", link: "/home", icon: MdOutlineDashboard, permissionKey: "Dashboard" },
    ],
  },
  {
    label: "Bookings & Trips",
    items: [
      {
        name: "Trips & Assign",
        icon: MdOutlineAssignment,
        permissionKey: "Booking",
        children: [
          { name: "Hourly Trips", link: "/home/booking/hourly", permissionKey: "Booking" },
          { name: "Outstation Trips", link: "/home/booking/outstation", permissionKey: "Booking" },
          { name: "Weekly Trips", link: "/home/booking/weekly", permissionKey: "Booking" },
          { name: "Monthly Trips", link: "/home/booking/monthly", permissionKey: "Booking" },
          { name: "Driver Cancel Requests", link: "/home/cancelrequest", permissionKey: "Booking" },
          { name: "Trip Cancel Requests", link: "/home/trip-cancel-requests", permissionKey: "Booking" },
        ],
      },
    ],
  },
  {
    label: "Drivers & Fleet",
    items: [
      {
        name: "Drivers",
        icon: MdOutlinePeople,
        permissionKey: "Driver",
        children: [
          { name: "All Drivers", link: "/home/driver", permissionKey: "Driver" },
          { name: "Pending Verification", link: "/home/driver?verified=pending", permissionKey: "Driver" },
        ],
      },
      {
        name: "Fleet Management",
        icon: MdOutlineDirectionsCar,
        permissionKey: "Vehicle",
        children: [
          { name: "Vehicle Preferences", link: "/home/VehiclePreference", permissionKey: "Vehicle" },
          { name: "Preference Categories", link: "/home/VehiclePreferenceCategory", permissionKey: "Vehicle" },
        ],
      },
      {
        name: "Vehicle Catalog",
        icon: MdOutlineDirectionsCar,
        children: [
          { name: "Vehicle Brands & Models", link: "/home/vehicleBrands", permissionKey: "VehicleBrand" },
        ],
      },
    ],
  },
  {
    label: "Users & Members",
    items: [
      { name: "App Users", link: "/home/users", icon: MdOutlinePerson, permissionKey: "User" },
      // { name: "Membership Plans", link: "/home/membership", icon: MdOutlinePeople, permissionKey: "Membership" },
    ],
  },
  {
    label: "Pricing & Fares",
    items: [
      {
        name: "Pricing Config",
        icon: MdOutlinePriceChange,
        permissionKey: "Pricing",
        children: [
          { name: "Premium Pricing", link: "/home/premiumPricing", permissionKey: "PremiumPricing" },
          { name: "Hourly Pricing", link: "/home/hourlyPricing", permissionKey: "HourlyPricing" },
          { name: "Weekly Pricing", link: "/home/weeklyPricing", permissionKey: "WeeklyPricing" },
          { name: "Monthly Pricing", link: "/home/monthlyPricing", permissionKey: "MonthlyPricing" },
          { name: "Outstation Pricing", link: "/home/outstationPricing", permissionKey: "OutstationPricing" },
        ],
      },
    ],
  },
  {
    label: "Support & Geo",
    items: [
      { name: "Support & Complaints", link: "/home/complaint", icon: MdOutlineSupportAgent, permissionKey: "Complaint" },
      {
        name: "Regions & Zones",
        icon: FaMapMarkedAlt,
        permissionKey: "Geography",
        children: [
          { name: "States", link: "/home/states", permissionKey: "State" },
          { name: "Cities", link: "/home/Cities", permissionKey: "City" },
        ],
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        name: "System Settings",
        icon: MdOutlineSettings,
        permissionKey: "Settings",
        children: [
          { name: "My Profile", link: "/home/my-profile", permissionKey: "Profile" },
          { name: "Roles & Permissions", link: "/home/role", permissionKey: "Role" },
          { name: "Admin Staff", link: "/home/admin-staff", permissionKey: "AdminStaff" },
          { name: "Global Config", link: "/home/appConfig", permissionKey: "Config" },
          { name: "Feedback Tags", link: "/home/feedbackTags", permissionKey: "Feedback" },
          { name: "Cancel Reasons", link: "/home/cancellationReasons", permissionKey: "CancelReason" },
          { name: "Banners", link: "/home/banner", permissionKey: "Banner" },
          { name: "Segments", link: "/home/segment", permissionKey: "Segment" },
          { name: "Night Times", link: "/home/NightTimes", permissionKey: "Config" },
        ],
      },
      {
        name: "CMS (Content)",
        icon: FaRegBuilding,
        permissionKey: "CMS",
        children: [
          { name: "FAQ", link: "/home/FAQ", permissionKey: "FAQ" },
          { name: "Terms & Conditions", link: "/home/TermAndCondition", permissionKey: "CMS" },
          { name: "Privacy Policy", link: "/home/PrivacyPolicy", permissionKey: "CMS" },
          { name: "About Us", link: "/home/AboutUs", permissionKey: "CMS" },
          { name: "Refund Policy", link: "/home/RefundPolicy", permissionKey: "CMS" },
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
      { label: "State", key: "state.name" },
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
      { label: "City", key: "city.name" },
      { label: "Night Charge (₹)", key: "nightCharge.amount" },
      { label: "Waiting Charge / Min (₹)", key: "waitingChargePerMin" },
      { label: "One Way Hourly Tiers", key: "oneWayHourly", type: "array_count" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true, submit: false },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      {
        label: "Night Charge",
        key: "nightCharge",
        type: "object",
        fields: [
          { label: "Amount (₹)", key: "amount", required: true, type: "number" },
          {
            label: "Night Charge Starts At (24-hour clock)",
            key: "fromHour",
            required: true,
            type: "number",
            step: 1,
            min: 0,
            max: 23,
            description: "Enter a whole hour from 0 to 23. For example, 22 means 10:00 PM.",
          },
          {
            label: "Night Charge Ends At (24-hour clock)",
            key: "toHour",
            required: true,
            type: "number",
            step: 1,
            min: 0,
            max: 23,
            description: "Enter a whole hour from 0 to 23. For example, 6 means 6:00 AM.",
          },
        ],
      },
      { label: "Waiting Charge Per Minute (₹)", key: "waitingChargePerMin", required: true, type: "number" },
      {
        label: "One Way Hourly",
        key: "oneWayHourly",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Hours", key: "hours", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      {
        label: "One Way Distance",
        key: "oneWayDistance",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Kilometers", key: "km", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      {
        label: "Round Trip Hourly",
        key: "roundTripHourly",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Hours", key: "hours", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      {
        label: "Round Trip Distance",
        key: "roundTripDistance",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Kilometers", key: "km", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      { label: "Status", key: "status", type: "boolean", defaultValue: true },
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
      { label: "City", key: "city.name" },
      { label: "Plans", key: "plans", type: "array_count" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true, submit: false },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      {
        label: "Monthly Plans",
        key: "plans",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Days Per Month", key: "daysPerMonth", required: true, type: "number" },
          { label: "Hours Per Day", key: "hoursPerDay", required: true, type: "number" },
          { label: "Salary (₹)", key: "salary", required: true, type: "number" },
          { label: "Service Fee (₹)", key: "serviceFee", required: true, type: "number" },
          { label: "Duration (Months)", key: "durationMonths", required: true, type: "number" },
        ],
      },
      { label: "Status", key: "status", type: "boolean", defaultValue: true }
    ]
  },
  outstationPricing: {
    title: "Outstation Pricing",
    endpoint: "/api/admin/outstationPricing",
    basePath: "/home/outstationPricing",
    permissions: "OutstationPricing",
    columns: [
      { label: "City", key: "city.name" },
      { label: "Round Trip Day Rates", key: "roundTripDays", type: "array_count" },
      { label: "One Way Distance Rates", key: "oneWayKm", type: "array_count" },
      { label: "Status", key: "status", type: "boolean" },
    ],
    fields: [
      { label: "State", key: "state", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/states", labelKey: "name", valueKey: "_id", fullWidth: true, submit: false },
      { label: "City", key: "city", required: true, type: "dynamic_select", optionsEndpoint: "/api/admin/cities", labelKey: "name", valueKey: "_id", fullWidth: true, dependsOn: "state", dependsParam: "state" },
      {
        label: "Round Trip Days",
        key: "roundTripDays",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Days", key: "days", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      {
        label: "One Way Kilometers",
        key: "oneWayKm",
        type: "array",
        minItems: 1,
        itemFields: [
          { label: "Kilometers", key: "km", required: true, type: "number" },
          { label: "Price (₹)", key: "price", required: true, type: "number" },
        ],
      },
      { label: "Status", key: "status", type: "boolean", defaultValue: true }
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
