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
    <div className="page-shell">
      <Breaker />

      <div className="mx-auto w-full max-w-5xl space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost -ml-2"
        >
          ← Back to App Users
        </button>

        <div className="card overflow-hidden">
          <div className="flex flex-col items-center gap-6 bg-[#111827] px-6 py-8 sm:flex-row">
            <img
              src={profileSrc}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-gray-200"
            />
            <div className="min-w-0 text-center sm:text-left">
              <h1 className="break-words text-2xl font-semibold tracking-tight text-white">{user.name || "Unknown User"}</h1>
              <p className="mt-1 text-slate-300">{user.mobile}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${user.isVerified ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" : "bg-amber-500/15 text-amber-300 ring-amber-400/30"}`}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${user.status !== false ? "bg-gray-100 text-gray-300 ring-gray-200" : "bg-rose-500/15 text-rose-300 ring-rose-400/30"}`}>
                  {user.status !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200/70 p-4 sm:grid-cols-3 sm:p-6">
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-center">
              <p className="detail-label">Total Trips</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{user.totalTrips ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-center">
              <p className="detail-label">Completed Trips</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{user.completedTrips ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-center">
              <p className="detail-label">Total Spent</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">₹{user.totalSpent ?? 0}</p>
            </div>
          </div>

          {user.planCounts && (
            <div className="border-b border-slate-200/70 p-4 sm:p-6">
              <h3 className="card-title mb-4">Plan Counts</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(user.planCounts).map(([plan, count]) => (
                  <div key={plan} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 text-center">
                    <p className="detail-label">{plan}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-800">{count ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <span className="detail-label">Email</span>
              <p className="detail-value">{user.email || "—"}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <span className="detail-label">Gender</span>
              <p className="detail-value capitalize">{user.gender || "—"}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <span className="detail-label">Rating</span>
              <p className="detail-value">{user.rating ?? "—"} ({user.ratingCount ?? 0} reviews)</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <span className="detail-label">Joined</span>
              <p className="detail-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
          </div>

          {user.recentBookings?.length > 0 && (
            <div className="border-t border-slate-200/70 p-4 sm:p-6">
              <h3 className="card-title mb-4">Recent Trips</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200/70">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-[#c99a2e]/40 bg-[#171b25] text-left text-[11px] font-semibold uppercase tracking-wider text-white/75">
                      <th className="px-4 py-3">Booking #</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentBookings.map((trip) => (
                      <tr key={trip._id} className="border-b border-slate-100 text-slate-700 last:border-0 hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <Link to={`/home/booking/bookingdetails/${trip._id}`} className="font-semibold text-slate-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500">
                            {trip.bookingNumber || trip._id.slice(-6)}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{trip.planType || "—"}</td>
                        <td className="px-4 py-3 capitalize">{trip.overallStatus || trip.tripStatus || "—"}</td>
                        <td className="px-4 py-3 capitalize">{trip.payment?.status || trip.paymentStatus || "—"}</td>
                        <td className="px-4 py-3 font-semibold">₹{trip.payment?.paidAmount ?? trip.estimatedFare ?? 0}</td>
                        <td className="px-4 py-3">{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString("en-IN") : "—"}</td>
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
