import React from "react";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./Pages/Dashborad/Dashboard";

// Banner
import BannerList from "./Pages/Banner/BannerList";
import CreateBanner from "./Pages/Banner/CreateBanner";
import UpdateBanner from "./Pages/Banner/UpdateBanner";
import BannerView from "./Pages/Banner/BannerView";


// Role
import RoleList from "./Pages/Roles/RoleList";
import CreateRole from "./Pages/Roles/CreateRole";
import UpdateRole from "./Pages/Roles/UpdateRole";

//Member
import MemberList from "./Pages/Member/MemberList";

import Login from "./loginpage/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import List from "./Pages/Term And Condition/List";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";
import AboutUs from "./Pages/AboutUs/AboutUs";

import FaqList from "./Pages/FAQ/FaqList";
import CreateFAQ from "./Pages/FAQ/CreateFaq";
import UpdateFAQ from "./Pages/FAQ/UpdateFAQ";
import FaqDetails from "./Pages/FAQ/FaqDetails";
import SegmentList from "./Pages/Segment/SegmentList";
import SegmentView from "./Pages/Segment/SegmentDetails";
import CreateSegment from "./Pages/Segment/SegmentCreate";
import UpdateSegment from "./Pages/Segment/SegmentUpdate";
import RegionList from "./Pages/Region/RegionList";
import CreateAgency from "./Pages/Banner/CreateBanner";
import CreateDriver from "./Pages/Driver/CreateDriver";
import DriverList from "./Pages/Driver/DriverList";
import DriverDetail from "./Pages/Driver/DriverDetails";
import UpdateDriver from "./Pages/Driver/DriverUpdate";
import PricingList from "./Pages/Pricing/PricingList";
import PricingDetails from "./Pages/Pricing/PricingDetails";
import PricingCreate from "./Pages/Pricing/PricingCreate";
import VehicleList from "./Pages/Vehicle/VehicleList";
import VehicleDetails from "./Pages/Vehicle/VehicleDetails";
import CreateVehicle from "./Pages/Vehicle/VehicleCreate";
import UpdateVehicle from "./Pages/Vehicle/VehicleUpdate";
import BookingList from "./Pages/Booking/BookingList";
import RefundPolicy from "./Pages/RefundPolicy/RefundPolicy";
import DeleteUser from "./Pages/DeleteAccount/DeleteUserAccount";
import DeleteDriver from "./Pages/DeleteAccount/DeleteDriverAccount";
import PlatformDependenciesList from "./Pages/latformDependencies/PlatformDependenciesList";
import BookingDetails from "./Pages/Booking/BookingDetails";
import ComplaintList from "./Pages/Complaint/ComplaintList";
import ComplaintView from "./Pages/Complaint/ComplaintDetails";
import ComplaintEdit from "./Pages/Complaint/ComplaintUpdate";
import AirportRegionList from "./Pages/AirportRegions/AirportRegionsList";
import AirportRegionView from "./Pages/AirportRegions/AirportRegionDetails";
import CreateAirportRegion from "./Pages/AirportRegions/AirportCreate";
import UpdateAirportRegion from "./Pages/AirportRegions/AirporeRegionsUpdate";
import DriverPrivacyPolicy from "./Pages/PrivacyPolicy/DriverPolicy";
import UserPrivacyPolicy from "./Pages/PrivacyPolicy/UserPrivacyPolicy";
import PricingUpdate from "./Pages/Pricing/PricingUpdate";
import CreateHolidays from "./Pages/Holidays/CreateHolidays";
import HolidayList from "./Pages/Holidays/HolidaysList";
import UpdateHoliday from "./Pages/Holidays/UpdateHolidays";
import CreateEtsUser from "./Pages/EtsUser/CreateEtsUser";
import EtsUserList from "./Pages/EtsUser/EtsUserlist";
import UpdateEtsUser from "./Pages/EtsUser/UpdateEtsUser";
import CreateEtsRoute from "./Pages/EtsRoutes/CreteEtsRoutes";
import ViewEtsUser from "./Pages/EtsUser/EtsUserDetails";
import EtsRouteList from "./Pages/EtsRoutes/EtsRoutesList";
import UpdateEtsRoute from "./Pages/EtsRoutes/UpdateEtsRoutes";
import EtsRouteDetails from "./Pages/EtsRoutes/EtsRoutesDetails";
import CreateEtsRouteShift from "./Pages/EtsRouteShift/CreateEtsRouteShift";
import EtsRouteShiftList from "./Pages/EtsRouteShift/EtsRouteShiftList";
import UpdateEtsRouteShift from "./Pages/EtsRouteShift/EtsRouteShiftUpdate";
import CreateEtsRouteShiftAssign from "./Pages/EtsRouteShiftAssign/CreateEtsRoutesShiftAssign";
import EtsRouteShiftAssignList from "./Pages/EtsRouteShiftAssign/EtsRouteShiftAssignList";
import EtsRouteShiftAssignView from "./Pages/EtsRouteShiftAssign/EtsRouteShiftAssignDetails";
import UpdateEtsRouteShiftAssign from "./Pages/EtsRouteShiftAssign/EtsRoutesShiftAssignUpdate";
import CancelRequestList from "./Pages/CancelRequest/getCancelRequestList";
import ShuttleRouteList from "./Pages/ShuttleRoute/ShuttleRouteList";
import EtsRouteShiftDetails from "./Pages/EtsRouteShift/EtsRouteShiftDetails";
import ShuttleRouteDetails from "./Pages/ShuttleRoute/ShuttleRouteDetails";
import CreateShuttleRoute from "./Pages/ShuttleRoute/ShuttleRouteCreate";
import UpdateShuttleRoute from "./Pages/ShuttleRoute/ShuttleRouteUpdate";
import ShuttleRouteShiftList from "./Pages/SuttleRouteShift/SuttleRouteShiftList";
import CreateShuttleRouteShift from "./Pages/SuttleRouteShift/CreateShuttleRouteShift";
import UpdateShuttleRouteShift from "./Pages/SuttleRouteShift/UpdateShuttleRouteShift";
import ShuttleRouteShiftDetails from "./Pages/SuttleRouteShift/ShuttleRouteShiftDetails";
import ShuttlePassList from "./Pages/ShuttlePass/ShuttlePassList";
import ShuttlePassView from "./Pages/ShuttlePass/ShuttlePassDetails";
import CreateShuttlePass from "./Pages/ShuttlePass/ShuttlePassCreate";
import UpdateShuttlePass from "./Pages/ShuttlePass/ShuttlePassUpdate";
import CreateShuttleRouteShiftAssign from "./Pages/ShuttleRouteShiftAssign/CreateSuttleRouteShiftAssign";
import ShuttleRouteShiftAssignList from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignList";
import ShuttleRouteShiftAssignView from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignDetails";
import UpdateShuttleRouteShiftAssign from "./Pages/ShuttleRouteShiftAssign/ShuttleRouteShiftAssignUpdate";
import CreateEtsUserStoppage from "./Pages/EtsUserStopPages/CreateEtsUserStopPages";
import PunchRegionList from "./Pages/PunchRegion/PunchRegionList";
import PunchRegionView from "./Pages/PunchRegion/PunchRegionDetails";
import CreatePunchRegion from "./Pages/PunchRegion/PunchRegionCreate";
import UpdatePunchRegion from "./Pages/PunchRegion/PunchRegionUpdae";
import EtsUserStoppageList from "./Pages/EtsUserStopPages/EtsUserStopPagesList";
import EtsUserStoppageDetails from "./Pages/EtsUserStopPages/EtsUserStopPagesDetails";
import UpdateEtsUserStoppage from "./Pages/EtsUserStopPages/EtsUserStopPagesUpdate";
import FuelLogsList from "./Pages/FuelLogs/FuelLogsList";
import FuelLogView from "./Pages/FuelLogs/FuelLogsDetails";
import PunchList from "./Pages/Punches/PunchesList";
import PunchView from "./Pages/Punches/PunchesDetails";
import PunchTodaySummary from "./Pages/Punches/PunchesTodaySummary";
import VehicleBookingDetails from "./Pages/Vehicle/VehicleBookingDetails";
import DriverBookingDetails from "./Pages/Driver/DriverAllTripDetails";
import ProfilePage from "./loginpage/MyProfile";
import SectionNameList from "./Pages/Membermaster/MemberMasterList";
import CreateMember from "./Pages/Member/CreateMember";
import HourlyPackageList from "./Pages/HourlyPackages/HourlyPackagesList";

// import UserPrivacyPolicyView from "./Pages/PrivacyPolicy/PrivacyPolicyView";



const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />, // redirect root to login
  },
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/Delete-user",
    element: <DeleteUser />,
  },

  {
    path: "/Delete-driver",
    element: <DeleteDriver />,
  },

  { path: "/driver/privacy-policy", element: <DriverPrivacyPolicy /> },
  { path: "/user/privacy-policy", element: <UserPrivacyPolicy /> },

  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      //profile
      // { path: "my-profile", element: <ProfilePage /> }, 

      // Banner routes
      // { path: "banner", element: <BannerList /> },
      // { path: "banner/createbanner", element: <CreateBanner /> },
      // { path: "banner/updatebanner/:id", element: <UpdateBanner /> }, 
      // { path: "banner/bannerview/:id", element: <BannerView /> },

      //Member route
      // { path: "member", element: <MemberList /> },
      // { path: "member/createmember", element: <CreateMember /> },

      // role
      // { path: "role", element: <RoleList /> },
      // { path: "role/createrole", element: <CreateRole /> },
      // { path: "role/updaterole/:id", element: <UpdateRole /> },

      //segment
      // { path: "segment", element: <SegmentList /> },
      // { path: "segment/segmentview/:id", element: <SegmentView /> },
      // { path: "segment/createsegment", element: <CreateSegment /> },
      // { path: "segment/updateSegment/:id", element: <UpdateSegment /> },

      //region
      // { path: "region", element: <RegionList /> },

      //driver
      // { path: "driver", element: <DriverList /> },
      // { path: "driver/createDriver", element: <CreateDriver /> },
      // { path: "driver/driverView/:id", element: <DriverDetail /> },
      // { path: "driver/driverBookingView/:id", element: <DriverBookingDetails /> },
      // { path: "driver/updateDriver/:id", element: <UpdateDriver /> },


      //terms and condition, privacy policy, about us   
      // { path: "TermAndCondition", element: <List /> },
      // { path: "PrivacyPolicy", element: <PrivacyPolicy /> },
      // { path: "AboutUs", element: <AboutUs /> },
      // { path: "RefundPolicy", element: <RefundPolicy /> },

      // FAQ
      // { path: "FAQ", element: <FaqList /> },
      // { path: "FAQ/createfaq", element: <CreateFAQ /> },
      // { path: "FAQ/updatefaq/:id", element: <UpdateFAQ /> },
      // { path: "FAQ/viewfaq/:id", element: <FaqDetails /> },

      //pricing
      // { path: "pricing", element: <PricingList /> },
      // { path: "pricing/pricingview/:id", element: <PricingDetails /> },
      // { path: "pricing/create", element: <PricingCreate /> },
      // { path: "pricing/update/:id", element: <PricingUpdate /> },

      //vehicle
      // { path: "vehicle", element: <VehicleList /> },
      // { path: "vehicle/vehicledetails/:id", element: <VehicleDetails /> },
      // { path: "vehicle/vehicleBooking/:id", element: <VehicleBookingDetails /> }, 
      // { path: "vehicle/create", element: <CreateVehicle /> },
      // { path: "vehicle/updateVehicle/:id", element: <UpdateVehicle /> },

      //Booking
      // { path: "booking", element: <BookingList /> },
      // { path: "booking/bookingdetails/:id", element: <BookingDetails /> },

      //cancel request
      // { path: "cancelrequest", element: <CancelRequestList /> },


      //plateform dependencies
      // { path: "platformdependencies", element: <PlatformDependenciesList /> },

      //cpmplaint
      // { path: "complaint", element: <ComplaintList /> },
      // { path: "complaint/complaintView/:id", element: <ComplaintView /> },
      // { path: "complaint/updateComplaint/:id", element: <ComplaintEdit /> },

      //aiport region
      // { path: "airportRegions", element: <AirportRegionList /> },
      // { path: "airportRegions/airportRegionsDetails/:id", element: <AirportRegionView /> },
      // { path: "airportRegions/create", element: <CreateAirportRegion /> },
      // { path: "airportRegions/update/:id", element: <UpdateAirportRegion /> },

      //holiday
      // { path: "holidays", element: <HolidayList /> },
      // { path: "holidays/create", element: <CreateHolidays /> },
      // { path: "holidays/update/:id", element: <UpdateHoliday /> },

      //etsUser
      // { path: "etsUser", element: <EtsUserList /> },
      // { path: "etsUser/create", element: <CreateEtsUser /> },
      // { path: "etsUser/view/:id", element: <ViewEtsUser /> },
      // { path: "etsUser/update/:id", element: <UpdateEtsUser /> },

      //etsRoute
      // { path: "etsRoutes", element: <EtsRouteList /> },
      // { path: "etsRoutes/create", element: <CreateEtsRoute /> },
      // { path: "etsRoutes/view/:id", element: <EtsRouteDetails /> },
      // { path: "etsRoutes/update/:id", element: <UpdateEtsRoute /> },

      //etsRouteShift
      // { path: "etsRouteShifts", element: <EtsRouteShiftList /> },
      // { path: "etsRouteShifts/create", element: <CreateEtsRouteShift /> },
      // { path: "etsRouteShifts/view/:id", element: <EtsRouteShiftDetails /> },
      // { path: "etsRouteShifts/update/:id", element: <UpdateEtsRouteShift /> },

      //etsRoutesShiftAssign
      // { path: "etsRouteShiftAssign", element: <EtsRouteShiftAssignList /> },
      // { path: "etsRouteShiftAssign/create", element: <CreateEtsRouteShiftAssign /> },
      // { path: "etsRouteShiftAssign/view/:id", element: <EtsRouteShiftAssignView /> },
      // { path: "etsRouteShiftAssign/update/:id", element: <UpdateEtsRouteShiftAssign /> },

      //shuttle route 
      // { path: "shuttleRoutes", element: <ShuttleRouteList /> },
      // { path: "shuttleRoutes/create", element: <CreateShuttleRoute /> },
      // { path: "shuttleRoutes/view/:id", element: <ShuttleRouteDetails /> },
      // { path: "shuttleRoutes/update/:id", element: <UpdateShuttleRoute /> },

      //shuttle route shift
      // { path: "shuttleRouteShifts", element: <ShuttleRouteShiftList /> },
      // { path: "shuttleRouteShifts/create", element: <CreateShuttleRouteShift /> },
      // { path: "shuttleRouteShifts/view/:id", element: <ShuttleRouteShiftDetails /> },
      // { path: "shuttleRouteShifts/update/:id", element: <UpdateShuttleRouteShift /> },

      //shutttle pass
      // { path: "shuttlePass", element: <ShuttlePassList /> },
      // { path: "shuttlePass/create", element: <CreateShuttlePass /> },
      // { path: "shuttlePass/view/:id", element: <ShuttlePassView /> },
      // { path: "shuttlePass/update/:id", element: <UpdateShuttlePass /> },

      //shuttle route shift assign
      // { path: "shuttleRouteShiftAssign", element: <ShuttleRouteShiftAssignList /> },
      // { path: "shuttleRouteShiftAssign/create", element: <CreateShuttleRouteShiftAssign /> },
      // { path: "shuttleRouteShiftAssign/view/:id", element: <ShuttleRouteShiftAssignView /> },
      // { path: "shuttleRouteShiftAssign/update/:id", element: <UpdateShuttleRouteShiftAssign /> },

      //etsUserStoppage
      // { path: "etsUserStopPages", element: <EtsUserStoppageList /> },
      // { path: "etsUserStopPages/create", element: <CreateEtsUserStoppage /> },
      // { path: "etsUserStopPages/view/:id", element: <EtsUserStoppageDetails /> },
      // { path: "etsUserStopPages/update/:id", element: <UpdateEtsUserStoppage /> },

      //punch region
      // { path: "punchRegion", element: <PunchRegionList /> },
      // { path: "punchRegion/create", element: <CreatePunchRegion /> },
      // { path: "punchRegion/view/:id", element: <PunchRegionView /> },
      // { path: "punchRegion/update/:id", element: <UpdatePunchRegion /> },

      //Fuel Logs
      // { path: "fuelLogs", element: <FuelLogsList /> },
      // { path: "fuelLogs/view/:id", element: <FuelLogView /> },
      
      //Punches
      // { path: "punches", element: <PunchList /> },
      // { path: "punches/view/:id", element: <PunchView /> },
      // { path: "punches/today-summary", element: <PunchTodaySummary /> },

      // //member master
      // { path: "memberMaster", element: <SectionNameList/> },

      //hourly packages
      // { path: "hourlyPackages", element: <HourlyPackageList /> },


    ],
  },
]);
//createCompatibility
const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default App;
