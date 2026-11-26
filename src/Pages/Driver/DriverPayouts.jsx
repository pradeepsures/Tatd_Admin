import React, { useEffect, useState } from "react";
import useAdminListState from "../../hooks/useAdminListState";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getDriverBankDetailsList } from "../../Services/DriverApi";
import Loader from "../../compoents/Loader";

export default function DriverPayouts() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useAdminListState("page", 1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useAdminListState("statusFilter", "");
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
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Driver Payouts (Bank Details)</h2>
          <p className="page-subtitle">View and manage bank details for driver payouts.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            className="field w-full sm:w-64"
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
          <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200/70">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#c99a2e]/40 bg-[#171b25] text-[11px] font-semibold uppercase tracking-wider text-white/75">
                  <th className="px-4 py-3 font-semibold">Driver</th>
                  <th className="px-4 py-3 font-semibold">Bank Status</th>
                  <th className="px-4 py-3 font-semibold">Account Holder</th>
                  <th className="px-4 py-3 font-semibold">Account Number</th>
                  <th className="px-4 py-3 font-semibold">IFSC</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-slate-700">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver._id} className="transition-colors odd:bg-slate-50/40 hover:bg-amber-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={driver.profilePic || "/default-avatar.png"}
                            alt={driver.name}
                            className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {driver.bankDetailsStatus === "verified" ? (
                          <span className="badge-success">Verified</span>
                        ) : driver.bankDetailsStatus === "not_added" ? (
                          <span className="badge-danger">Missing</span>
                        ) : (
                          <span className="badge-warning">Pending/Invalid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{driver.bankInfo?.accountHolderName || "-"}</td>
                      <td className="px-4 py-3">
                        {driver.bankInfo?.accountNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800">{driver.bankInfo.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(driver.bankInfo.accountNumber)}
                              className="btn-icon h-8 w-8"
                              title="Copy"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{driver.bankInfo?.ifscCode || "-"}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/drivers/${driver._id}`}
                          className="whitespace-nowrap text-sm font-semibold text-slate-900 underline-offset-4 hover:text-gray-600 hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-14 text-center text-slate-400">
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
          <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`btn-secondary w-full sm:w-auto ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`btn-secondary w-full sm:w-auto ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
