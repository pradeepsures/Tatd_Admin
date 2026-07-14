import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./Pages/Dashborad/Dashboard";
import Login from "./loginpage/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import DynamicList from "./components/Dynamic/DynamicList";
import DynamicForm from "./components/Dynamic/DynamicForm";
import { MODULE_CONFIGS } from "./config/routesConfig";

// Users & Profile
import UserList from "./Pages/User/UserList";
import CreateUser from "./Pages/User/CreateUser";
import UpdateUser from "./Pages/User/UpdateUser";
import ViewUser from "./Pages/User/ViewUser";
import ProfilePage from "./loginpage/MyProfile";

// Chauffeurs (Drivers)
import DriverList from "./Pages/Driver/DriverList";
import CreateDriver from "./Pages/Driver/CreateDriver";
import DriverDetail from "./Pages/Driver/DriverDetails";
import UpdateDriver from "./Pages/Driver/DriverUpdate";
import DriverBookingDetails from "./Pages/Driver/DriverAllTripDetails";

// Vehicles
import VehicleList from "./Pages/Vehicle/VehicleList";
import VehicleDetails from "./Pages/Vehicle/VehicleDetails";
import CreateVehicle from "./Pages/Vehicle/VehicleCreate";
import UpdateVehicle from "./Pages/Vehicle/VehicleUpdate";
import VehicleBookingDetails from "./Pages/Vehicle/VehicleBookingDetails";

// Bookings / Trips
import BookingList from "./Pages/Booking/BookingList";
import BookingDetails from "./Pages/Booking/BookingDetails";
import PendingAssignments from "./Pages/Booking/PendingAssignments";
import CancelRequestList from "./Pages/CancelRequest/getCancelRequestList";
import TripCancelRequestList from "./Pages/CancelRequest/TripCancelRequestList";
import HourlyBookingList from "./Pages/Booking/HourlyBookingList";
import WeeklyBookingList from "./Pages/Booking/WeeklyBookingList";
import MonthlyBookingList from "./Pages/Booking/MonthlyBookingList";
import OutstationBookingList from "./Pages/Booking/OutstationBookingList";

// Pricing
import PricingList from "./Pages/Pricing/PricingList";
import PricingDetails from "./Pages/Pricing/PricingDetails";
import PricingCreate from "./Pages/Pricing/PricingCreate";
import PricingUpdate from "./Pages/Pricing/PricingUpdate";

// Support / Complaints
import ComplaintList from "./Pages/Complaint/ComplaintList";
import ComplaintView from "./Pages/Complaint/ComplaintDetails";
import ComplaintEdit from "./Pages/Complaint/ComplaintUpdate";

// CMS & Settings
import AppConfig from "./Pages/Settings/AppConfig";
import OutstationPricing from "./Pages/Settings/OutstationPricing";
import FeedbackTags from "./Pages/Settings/FeedbackTags";
import CancellationReasons from "./Pages/Settings/CancellationReasons";
import BannerList from "./Pages/Banner/BannerList";
import CreateBanner from "./Pages/Banner/CreateBanner";
import UpdateBanner from "./Pages/Banner/UpdateBanner";
import BannerView from "./Pages/Banner/BannerView";

// CMS Pages
import List from "./Pages/Term And Condition/List";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";
import AboutUs from "./Pages/AboutUs/AboutUs";
import RefundPolicy from "./Pages/RefundPolicy/RefundPolicy";

import PublicPrivacyPolicy from "./Pages/Public/PublicPrivacyPolicy";
import PublicTermsAndConditions from "./Pages/Public/PublicTermsAndConditions";
import PublicDeleteAccount from "./Pages/Public/PublicDeleteAccount";

import RoleList from "./Pages/Roles/RoleList";
import CreateRole from "./Pages/Roles/CreateRole";
import UpdateRole from "./Pages/Roles/UpdateRole";
import FaqList from "./Pages/FAQ/FaqList";
import CreateFAQ from "./Pages/FAQ/CreateFaq";
import UpdateFAQ from "./Pages/FAQ/UpdateFAQ";
import FaqDetails from "./Pages/FAQ/FaqDetails";
import SegmentList from "./Pages/Segment/SegmentList";
import SegmentView from "./Pages/Segment/SegmentDetails";
// import CreateSegment from "./Pages/Segment/SegmentCreate";
// import UpdateSegment from "./Pages/Segment/SegmentUpdate";
import RegionList from "./Pages/Region/RegionList";
import CreateAgency from "./Pages/Banner/CreateBanner";
 
import AirportRegionList from "./Pages/AirportRegions/AirportRegionsList";
import AirportRegionView from "./Pages/AirportRegions/AirportRegionDetails";
import CreateAirportRegion from "./Pages/AirportRegions/AirportCreate";
import UpdateAirportRegion from "./Pages/AirportRegions/AirporeRegionsUpdate";
import DriverPrivacyPolicy from "./Pages/PrivacyPolicy/DriverPolicy";
import UserPrivacyPolicy from "./Pages/PrivacyPolicy/UserPrivacyPolicy";
// import CreateHolidays from "./Pages/Holidays/CreateHolidays";
// import HolidayList from "./Pages/Holidays/HolidaysList";
// import UpdateHoliday from "./Pages/Holidays/UpdateHolidays";
// import CreateEtsUser from "./Pages/EtsUser/CreateEtsUser";
// import EtsUserList from "./Pages/EtsUser/EtsUserlist";
// import UpdateEtsUser from "./Pages/EtsUser/UpdateEtsUser";
// import CreateEtsRoute from "./Pages/EtsRoutes/CreteEtsRoutes";
// import ViewEtsUser from "./Pages/EtsUser/EtsUserDetails";
// import EtsRouteList from "./Pages/EtsRoutes/EtsRoutesList";
// import UpdateEtsRoute from "./Pages/EtsRoutes/UpdateEtsRoutes";
// import EtsRouteDetails from "./Pages/EtsRoutes/EtsRoutesDetails";
// import CreateEtsRouteShift from "./Pages/EtsRouteShift/CreateEtsRouteShift";
// import EtsRouteShiftList from "./Pages/EtsRouteShift/EtsRouteShiftList";
// import UpdateEtsRouteShift from "./Pages/EtsRouteShift/EtsRouteShiftUpdate";
// import CreateEtsRouteShiftAssign from "./Pages/EtsRouteShiftAssign/CreateEtsRoutesShiftAssign";
// import EtsRouteShiftAssignList from "./Pages/EtsRouteShiftAssign/EtsRouteShiftAssignList";
// import EtsRouteShiftAssignView from "./Pages/EtsRouteShiftAssign/EtsRouteShiftAssignDetails";
// import UpdateEtsRouteShiftAssign from "./Pages/EtsRouteShiftAssign/EtsRoutesShiftAssignUpdate";
// import ShuttleRouteList from "./Pages/ShuttleRoute/ShuttleRouteList";
// import EtsRouteShiftDetails from "./Pages/EtsRouteShift/EtsRouteShiftDetails";
// import ShuttleRouteDetails from "./Pages/ShuttleRoute/ShuttleRouteDetails";
// import CreateShuttleRoute from "./Pages/ShuttleRoute/ShuttleRouteCreate";
// import UpdateShuttleRoute from "./Pages/ShuttleRoute/ShuttleRouteUpdate";
// import ShuttleRouteShiftList from "./Pages/SuttleRouteShift/SuttleRouteShiftList";
// import CreateShuttleRouteShift from "./Pages/SuttleRouteShift/CreateShuttleRouteShift";
// import UpdateShuttleRouteShift from "./Pages/SuttleRouteShift/UpdateShuttleRouteShift";
// import ShuttleRouteShiftDetails from "./Pages/SuttleRouteShift/ShuttleRouteShiftDetails";
// import ShuttlePassList from "./Pages/ShuttlePass/ShuttlePassList";
// import ShuttlePassView from "./Pages/ShuttlePass/ShuttlePassDetails";
// import CreateShuttlePass from "./Pages/ShuttlePass/ShuttlePassCreate";
// import UpdateShuttlePass from "./Pages/ShuttlePass/ShuttlePassUpdate";
// import CreateShuttleRouteShiftAssign from "./Pages/ShuttleRouteShiftAssign/CreateSuttleRouteShiftAssign";
// import ShuttleRouteShiftAssignList from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignList";
// import ShuttleRouteShiftAssignView from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignDetails";
// import UpdateShuttleRouteShiftAssign from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignUpdate";
// import CreateEtsUserStoppage from "./Pages/EtsUserStopPages/CreateEtsUserStopPages";
// import PunchRegionList from "./Pages/PunchRegion/PunchRegionList";
// import PunchRegionView from "./Pages/PunchRegion/PunchRegionDetails";
// import CreatePunchRegion from "./Pages/PunchRegion/PunchRegionCreate";
// import UpdatePunchRegion from "./Pages/PunchRegion/PunchRegionUpdae";
// import EtsUserStoppageList from "./Pages/EtsUserStopPages/EtsUserStopPagesList";
// import EtsUserStoppageDetails from "./Pages/EtsUserStopPages/EtsUserStopPagesDetails";
// import UpdateEtsUserStoppage from "./Pages/EtsUserStopPages/EtsUserStopPagesUpdate";
// import FuelLogsList from "./Pages/FuelLogs/FuelLogsList";
// import FuelLogView from "./Pages/FuelLogs/FuelLogsDetails";
// import PunchList from "./Pages/Punches/PunchesList";
// import PunchView from "./Pages/Punches/PunchesDetails";
// import PunchTodaySummary from "./Pages/Punches/PunchesTodaySummary";

// import SectionNameList from "./Pages/Membermaster/MemberMasterList";
// import CreateMember from "./Pages/Member/CreateMember";
import UpdateMember from "./Pages/Member/UpdateMember";
// import HourlyPackageList from "./Pages/HourlyPackages/HourlyPackagesList";
import StatesList from "./Pages/States/StatesList";
import CitiesList from "./Pages/Cities/CitiesList";
import VehiclePreferenceList from "./Pages/VehiclePreference/VehiclePreferenceList";
import VehiclePreferenceCategoryList from "./Pages/VehiclePreferenceCategory/VehivlePreferenceCategoryList";
import NightTimesList from "./Pages/NightTime/NightTimeList";
// import HourlyPricingList from "./Pages/HourlyPricing/HourlyPricingList";
// import WeeklyPricingList from "./Pages/WeeklyPricing/WeeklyPricingList";
// import MonthlyPricingList from "./Pages/MonthlyPricing/MonthlyPricingList";
// import OutstationPricingList from "./Pages/OutstationPricing/OutstationPricingList";

import HourlyBookingDetails from "./Pages/hourlyBooking/HourlyBookingDetails";
import AssignedDriversList from "./Pages/Driver/AssignedDriverList";

import MembershipPlanList from "./Pages/Membership/MembershipPlanList";
import MembershipPlanCreate from "./Pages/Membership/MembershipPlanCreate";
import MembershipPlanUpdate from "./Pages/Membership/MembershipPlanUpdate";

// import UserPrivacyPolicyView from "./Pages/PrivacyPolicy/PrivacyPolicyView";

const Unauthorized = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
      <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <a href="/home" className="text-blue-600 font-medium hover:underline">Go to Dashboard</a>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/privacy-policy",
    element: <PublicPrivacyPolicy />,
  },
  {
    path: "/terms-and-conditions",
    element: <PublicTermsAndConditions />,
  },
  {
    path: "/delete-account",
    element: <PublicDeleteAccount />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      // Profile
      { path: "my-profile", element: <ProfilePage /> },
      
      // Users
      { path: "users", element: <UserList /> },
      { path: "users/createuser", element: <CreateUser /> },
      { path: "users/updateuser/:id", element: <UpdateUser /> },
      { path: "users/viewuser/:id", element: <ViewUser /> },
      
      // Chauffeurs
      { path: "driver", element: <DriverList /> },
      { path: "driver/createDriver", element: <CreateDriver /> },
      { path: "driver/driverView/:id", element: <DriverDetail /> },
      { path: "driver/driverBookingView/:id", element: <DriverBookingDetails /> },
      { path: "driver/updateDriver/:id", element: <UpdateDriver /> },
      
      // Vehicles
      { path: "vehicle", element: <VehicleList /> },
      { path: "vehicle/create", element: <CreateVehicle /> },
      { path: "vehicle/vehicledetails/:id", element: <VehicleDetails /> },
      { path: "vehicle/updateVehicle/:id", element: <UpdateVehicle /> },
      { path: "vehicle/vehicleBooking/:id", element: <VehicleBookingDetails /> },
      
      // Trips
      { path: "booking", element: <BookingList /> },
      { path: "booking/hourly", element: <HourlyBookingList /> },
      { path: "booking/weekly", element: <WeeklyBookingList /> },
      { path: "booking/monthly", element: <MonthlyBookingList /> },
      { path: "booking/outstation", element: <OutstationBookingList /> },
      { path: "booking/bookingdetails/:id", element: <BookingDetails /> },
      { path: "cancelrequest", element: <CancelRequestList /> },
      { path: "trip-cancel-requests", element: <TripCancelRequestList /> },
      
      // Pricing
      { path: "pricing", element: <PricingList /> },
      { path: "pricing/create", element: <PricingCreate /> },
      { path: "pricing/pricingview/:id", element: <PricingDetails /> },
      { path: "pricing/update/:id", element: <PricingUpdate /> },
      
      // Support
      { path: "complaint", element: <ComplaintList /> },
      { path: "complaint/complaintView/:id", element: <ComplaintView /> },
      { path: "complaint/updateComplaint/:id", element: <ComplaintEdit /> },
      
      // CMS & Settings
      // { path: "banner", element: <BannerList /> },
      // { path: "banner/createbanner", element: <CreateBanner /> },
      // { path: "banner/updatebanner/:id", element: <UpdateBanner /> },
      // { path: "banner/bannerview/:id", element: <BannerView /> },
      
      { path: "TermAndCondition", element: <List /> },
      { path: "PrivacyPolicy", element: <PrivacyPolicy /> },
      { path: "AboutUs", element: <AboutUs /> },
      { path: "RefundPolicy", element: <RefundPolicy /> },
      
      { path: "role", element: <RoleList /> },
      { path: "role/createrole", element: <CreateRole /> },
      { path: "role/updaterole/:id", element: <UpdateRole /> },
      
      // { path: "FAQ", element: <FaqList /> },
      // { path: "FAQ/createfaq", element: <CreateFAQ /> },
      // { path: "FAQ/updatefaq/:id", element: <UpdateFAQ /> },
      // { path: "FAQ/viewfaq/:id", element: <FaqDetails /> },
      
      { path: "appConfig", element: <AppConfig /> },
      // { path: "outstationPricing", element: <OutstationPricing /> },
      { path: "feedbackTags", element: <FeedbackTags /> },
      { path: "cancellationReasons", element: <CancellationReasons /> },
      
      //segment
      { path: "segment", element: <SegmentList /> },
      { path: "segment/segmentview/:id", element: <SegmentView /> },
      // { path: "segment/createsegment", element: <CreateSegment /> },
      // { path: "segment/updateSegment/:id", element: <UpdateSegment /> },

      //region
      { path: "region", element: <RegionList /> },

      //hourly packages
      // { path: "hourlyPackages", element: <HourlyPackageList /> },

      //hourly pricing 
      // { path: "hourlyPricing", element: <HourlyPricingList/> },
      
      //weekly pricing 
      // { path: "weeklyPricing", element: <WeeklyPricingList/> },
      
      //monthly pricing 
      // { path: "monthlyPricing", element: <MonthlyPricingList/> },
      
      //outstation pricing 
      // { path: "outstationPricing", element: <OutstationPricingList/> },

      //states
      // { path:"states", element: <StatesList/> },

      //cities
      // { path:"Cities", element: <CitiesList/> },

      //vehicle Preference
      { path: "VehiclePreference", element: <VehiclePreferenceList/> },

      //vehicle preference category
      { path: "VehiclePreferenceCategory", element: <VehiclePreferenceCategoryList/> },

      //night Times
      { path: "NightTimes", element: <NightTimesList/> },
      
      // Membership Plans
      { path: "membership", element: <MembershipPlanList /> },
      { path: "membership/create", element: <MembershipPlanCreate /> },
      { path: "membership/update/:id", element: <MembershipPlanUpdate /> },
      
      // Dynamic Routes Generated from Config
      ...Object.values(MODULE_CONFIGS).flatMap(config => {
        // Strip "/home/" from basePath for react-router children path
        const pathBase = config.basePath.replace("/home/", "");
        return [
          { path: pathBase, element: <DynamicList config={config} /> },
          { path: `${pathBase}/create`, element: <DynamicForm config={config} /> },
          { path: `${pathBase}/update/:id`, element: <DynamicForm config={config} /> },
          { path: `${pathBase}/view/:id`, element: <DynamicForm config={config} readOnly={true} /> },
        ];
      })
    ],
  },
]);

import { io } from "socket.io-client";

const NOTIFICATION_SOUND = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

const App = () => {
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_BASE_URL?.replace('/api', '') || "http://localhost:9060";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Admin Socket Connected:", socket.id);
      socket.emit("join_admin");
    });

    socket.on("admin_notification", (data) => {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(e => console.log("Audio auto-play blocked by browser:", e));
      toast.success(data.title ? `${data.title}\n${data.body}` : (data.body || "New Notification!"), {
        duration: 5000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
