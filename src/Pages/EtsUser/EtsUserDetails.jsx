import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getEtsUserById } from "../../Services/EtsUserApi";

const ViewEtsUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ FETCH USER
  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await getEtsUserById(id);

      if (res?.status) {
        setUser(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Error fetching user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        No user found
      </div>
    );
  }

  return (
    <div className="m-3">
      <Breaker />

      <div className="mt-6 bg-white p-6 w-full rounded-xl shadow-xl">

        {/* PROFILE */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={user.profilePic || "/no-image.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-gray-500">
              {user.countryCode} {user.mobile}
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-6">

          <Detail label="Gender" value={user.gender || "N/A"} />
          <Detail label="Professional Title" value={user.professionalTitle || "N/A"} />
          <Detail label="City" value={user.city || "N/A"} />
          <Detail label="Wallet Balance" value={`₹ ${user.walletBalance || "0"}`} />
          <Detail label="Rating" value={user.rating || "N/A"} />
          <Detail label="Rating Count" value={user.ratingCount || "0"} />

          <Detail
            label="Date of Birth"
            value={
              user.dob
                ? new Date(user.dob).toLocaleDateString()
                : "N/A"
            }
          />

          <Detail
            label="Verified"
            value={
              user.isVerified ? (
                <span className="text-green-600 font-semibold">
                  Yes
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  No
                </span>
              )
            }
          />

          <Detail
            label="Deleted"
            value={
              user.isDeleted ? (
                <span className="text-red-600 font-semibold">
                  Yes
                </span>
              ) : (
                <span className="text-green-600 font-semibold">
                  No
                </span>
              )
            }
          />

          {/* <Detail label="Device Type" value={user.deviceType || "N/A"} />
          <Detail label="Device ID" value={user.deviceId || "N/A"} /> */}

          <Detail
            label="Created At"
            value={new Date(user.createdAt).toLocaleString()}
          />

          <Detail
            label="Updated At"
            value={new Date(user.updatedAt).toLocaleString()}
          />

        </div>

        {/* BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded-xl"
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

// ✅ REUSABLE COMPONENT
const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="font-semibold">{value || "N/A"}</p>
  </div>
);

export default ViewEtsUser;