import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getDriverBankDetailsList } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

export default function DriverPayouts() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 10;

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await getDriverBankDetailsList(page, limit, statusFilter);
      if (res?.status) {
        setDrivers(res.data);
        setTotalPages(res.pagination.pages || 1);
      }
    } catch (err) {
      // Error handled by API
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, statusFilter]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Account Number Copied!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">Driver Payouts (Bank Details)</h2>
        <p className="text-sm opacity-90">View and manage bank details for driver payouts.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <select
            className="border p-2 rounded w-64"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="not_added">Not Added</option>
            <option value="pending_verification">Pending / Invalid</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b">Driver</th>
                  <th className="p-3 border-b">Bank Status</th>
                  <th className="p-3 border-b">Account Holder</th>
                  <th className="p-3 border-b">Account Number</th>
                  <th className="p-3 border-b">IFSC</th>
                  <th className="p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={driver.profilePic || "/default-avatar.png"}
                            alt={driver.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-xs text-gray-500">{driver.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {driver.bankDetailsStatus === "verified" ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Verified</span>
                        ) : driver.bankDetailsStatus === "not_added" ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Missing</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Pending/Invalid</span>
                        )}
                      </td>
                      <td className="p-3">{driver.bankInfo?.accountHolderName || "-"}</td>
                      <td className="p-3">
                        {driver.bankInfo?.accountNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{driver.bankInfo.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(driver.bankInfo.accountNumber)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Copy"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">{driver.bankInfo?.ifscCode || "-"}</td>
                      <td className="p-3">
                        <Link
                          to={`/admin/drivers/${driver._id}`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No drivers found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 border rounded ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 border rounded ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
