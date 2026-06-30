import React from "react";
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

import RoleList from "./Pages/Roles/RoleList";
import CreateRole from "./Pages/Roles/CreateRole";
import UpdateRole from "./Pages/Roles/UpdateRole";
import FaqList from "./Pages/FAQ/FaqList";
import CreateFAQ from "./Pages/FAQ/CreateFaq";
import UpdateFAQ from "./Pages/FAQ/UpdateFAQ";
import FaqDetails from "./Pages/FAQ/FaqDetails";

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
      { path: "booking/pending", element: <PendingAssignments /> },
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
      { path: "banner", element: <BannerList /> },
      { path: "banner/createbanner", element: <CreateBanner /> },
      { path: "banner/updatebanner/:id", element: <UpdateBanner /> },
      { path: "banner/bannerview/:id", element: <BannerView /> },
      
      { path: "TermAndCondition", element: <List /> },
      { path: "PrivacyPolicy", element: <PrivacyPolicy /> },
      { path: "AboutUs", element: <AboutUs /> },
      { path: "RefundPolicy", element: <RefundPolicy /> },
      
      { path: "role", element: <RoleList /> },
      { path: "role/createrole", element: <CreateRole /> },
      { path: "role/updaterole/:id", element: <UpdateRole /> },
      
      { path: "FAQ", element: <FaqList /> },
      { path: "FAQ/createfaq", element: <CreateFAQ /> },
      { path: "FAQ/updatefaq/:id", element: <UpdateFAQ /> },
      { path: "FAQ/viewfaq/:id", element: <FaqDetails /> },
      
      { path: "appConfig", element: <AppConfig /> },
      { path: "outstationPricing", element: <OutstationPricing /> },
      { path: "feedbackTags", element: <FeedbackTags /> },
      { path: "cancellationReasons", element: <CancellationReasons /> },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default App;
