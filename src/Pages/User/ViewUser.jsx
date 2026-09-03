import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import { getSingleAdminApi } from "../../Services/UserApi";
import { getImageUrl } from "../../utils/imageUtils";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getSingleAdminApi(id);
      if (res.status) {
        setUser(res.data);
      } else {
        toast.error(res.message || "Failed to fetch user");
        navigate(-1);
      }
    } catch {
      toast.error("Something went wrong");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  if (loading) return <Loader />;
  if (!user) return null;

  const profileSrc = getImageUrl(user.profileImage || user.profilePic);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <Breaker />

      <div className="max-w-5xl mx-auto mt-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to App Users
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#334155] px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
            <img
              src={profileSrc}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{user.name || "Unknown User"}</h1>
              <p className="text-gray-300 mt-1">{user.mobile}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isVerified ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status !== false ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}`}>
                  {user.status !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold text-blue-700">{user.totalTrips ?? 0}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Completed Trips</p>
              <p className="text-2xl font-bold text-green-700">{user.completedTrips ?? 0}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-purple-700">₹{user.totalSpent ?? 0}</p>
            </div>
          </div>

          {user.planCounts && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Plan Counts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(user.planCounts).map(([plan, count]) => (
                  <div key={plan} className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{plan}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-2">{count ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-semibold text-gray-900">{user.email || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Gender</span>
              <p className="font-semibold text-gray-900 capitalize">{user.gender || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Rating</span>
              <p className="font-semibold text-gray-900">{user.rating ?? "—"} ({user.ratingCount ?? 0} reviews)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Joined</span>
              <p className="font-semibold text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
          </div>

          {user.recentBookings?.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Trips</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4">Booking #</th>
                      <th className="pb-2 pr-4">Plan</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Payment</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentBookings.map((trip) => (
                      <tr key={trip._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <Link to={`/home/booking/bookingdetails/${trip._id}`} className="text-blue-600 hover:underline font-medium">
                            {trip.bookingNumber || trip._id.slice(-6)}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">{trip.planType || "—"}</td>
                        <td className="py-3 pr-4 capitalize">{trip.overallStatus || trip.tripStatus || "—"}</td>
                        <td className="py-3 pr-4 capitalize">{trip.payment?.status || trip.paymentStatus || "—"}</td>
                        <td className="py-3 pr-4">₹{trip.payment?.paidAmount ?? trip.estimatedFare ?? 0}</td>
                        <td className="py-3">{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
