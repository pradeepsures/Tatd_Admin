import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import { getSingleAdminApi, UserWalletApi } from "../../Services/UserApi";

import { getImageUrl } from "../../utils/imageUtils";

// const BASE_URL =
//   import.meta.env.VITE_BASE_URL || "https://your-default-base-url.com";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState("credit");
  console.log(walletAmount, "walletAmount");
  console.log(walletType, "walletType");
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
    } catch (error) {
      toast.error("Something went wrong");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);
  const handleWalletSubmit = async () => {
    if (!walletAmount || !walletType) {
      toast.error("Please enter amount and select type");
      return;
    }

    const payload = {
      userId: id,
      amount: Number(walletAmount),
      type: walletType,
    };

    try {
      const res = await UserWalletApi(payload);
      if (res.status) {
        toast.success(res.message || "Wallet updated successfully!");
        setIsWalletModalOpen(false);
        setWalletAmount("");
        setWalletType("credit");
        fetchUser(); // Optional: refresh user wallet balance
      } else {
        toast.error(res.message || "Failed to update wallet");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (loading) return <Loader />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-9xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 transform transition-all duration-300 hover:shadow-3xl">
        {/* Header with Profile Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={getImageUrl(user.profileImage)}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-bold">
                {user.status ? "✓" : "✗"}
              </span>
            </div>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900 text-center">
            {user.name || "Unknown User"}
            <span className="text-red-600"> Details</span>
          </h2>
          {/* <p className="text-sm text-gray-500 mt-1">
            {user.profession || "No profession specified"}
          </p> */}
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">Email</span>
            <p className="text-base text-gray-900 font-semibold">
              {user.email || "-"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">Mobile</span>
            <p className="text-base text-gray-900 font-semibold">
              {user.mobile || "-"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">
              Date of Birth
            </span>
            <p className="text-base text-gray-900 font-semibold">
              {user.dob
                ? new Date(user.dob).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">Gender</span>
            <p className="text-base text-gray-900 font-semibold capitalize">
              {user.gender || "-"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <p
              className={`text-base font-semibold ${
                user.status ? "text-green-600" : "text-red-600"
              }`}
            >
              {user.status ? "Active" : "Inactive"}
            </p>
          </div>
          {/* <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md">
            <span className="text-sm font-medium text-gray-600">
              Profession
            </span>
            <p className="text-base text-gray-900 font-semibold">
              {user.profession || "-"}
            </p>
          </div> */}
        </div>

        {/* Wallet Details */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Wallet Information
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-600">
                Available Balance
              </span>
              <p className="text-xl font-bold text-green-600">
                ₹{user.wallet?.balance ?? 0}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Locked Balance
              </span>
              <p className="text-xl font-bold text-red-600">
                ₹{user.wallet?.lockedBalance ?? 0}
              </p>
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-3 py-1.5 bg-yellow-800 text-white rounded-md mt-2"
              >
                Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
          >
            Back
          </button>
        </div>
      </div>

      {/* Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Wallet Transaction</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleWalletSubmit}
                className="px-4 py-2 bg-yellow-800 text-white rounded-md hover:bg-yellow-900"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUser;
