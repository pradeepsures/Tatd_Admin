import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCancellationReasons, createCancellationReason, updateCancellationReason, deleteCancellationReason } from "../../Services/SettingsApi";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { TrashIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CancellationReasons() {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [newReasonText, setNewReasonText] = useState("");
  const [newRole, setNewRole] = useState("driver");
  const [isActive, setIsActive] = useState(true);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const res = await getCancellationReasons();
      if (res?.success || res?.status) {
        setReasons(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load Cancellation Reasons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, []);

  const handleEditInit = (reason) => {
    setEditingId(reason._id);
    setNewReasonText(reason.reasonText || reason.reason || "");
    setNewRole(reason.role || reason.type || "driver");
    setIsActive(reason.isActive !== undefined ? reason.isActive : true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewReasonText("");
    setNewRole("driver");
    setIsActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReasonText.trim()) return toast.error("Reason text is required");
    
    try {
      setSaving(true);
      const payload = {
        reasonText: newReasonText,
        role: newRole,
        isActive: isActive,
      };

      let res;
      if (editingId) {
        res = await updateCancellationReason(editingId, payload);
      } else {
        res = await createCancellationReason(payload);
      }

      if (res?.success || res?.status) {
        toast.success(`Cancellation Reason ${editingId ? 'updated' : 'added'}`);
        resetForm();
        fetchReasons();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reason?")) return;
    try {
      const res = await deleteCancellationReason(id);
      if (res?.success || res?.status) {
        toast.success("Cancellation Reason deleted");
        fetchReasons();
      }
    } catch (error) {
      toast.error("Failed to delete reason");
    }
  };

  const toggleActive = async (reason) => {
    try {
      const res = await updateCancellationReason(reason._id, { isActive: !reason.isActive });
      if (res?.success || res?.status) {
        toast.success(`Reason ${!reason.isActive ? 'Activated' : 'Deactivated'}`);
        fetchReasons();
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  if (loading && reasons.length === 0) return <Loader />;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Cancellation Reasons</h2>
          <p className="page-subtitle">Manage the options shown when a user or driver cancels a ride</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        
        {/* ADD / EDIT FORM */}
        <div className="lg:col-span-1">
          <div className="card card-pad lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200/70 pb-4">
              <h3 className="card-title">
                {editingId ? "Edit Reason" : "Add New Reason"}
              </h3>
              {editingId && (
                <button onClick={resetForm} className="btn-icon hover:!text-rose-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="field-label">Reason Text</label>
                <textarea
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  className="field resize-none"
                  placeholder="e.g. Passenger is unreachable"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="field-label">Role (Target)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="field"
                >
                  <option value="driver">Driver App</option>
                  <option value="user">User App</option>
                  <option value="both">Both Apps</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="cursor-pointer text-sm font-semibold text-slate-700">
                  Active (Visible in App)
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full ${editingId ? 'btn-gold' : 'btn-primary'}`}
              >
                {saving ? <LoderBtn /> : editingId ? "Update Reason" : "Add Reason"}
              </button>
            </form>
          </div>
        </div>

        {/* REASONS LIST */}
        <div className="lg:col-span-2">
          <div className="card card-pad">
            <h3 className="card-title mb-4">Active Reasons</h3>

            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70">
              <table className="w-full min-w-[560px] text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#c99a2e]/40 bg-[#171b25] text-[11px] font-semibold uppercase tracking-wider text-white/75">
                    <th className="py-3 px-4 text-xs font-semibold text-white/75">Reason</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75 w-24">Role</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75 w-24 text-center">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reasons.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-14 text-center text-slate-400">No Cancellation Reasons found</td>
                    </tr>
                  ) : (
                    reasons.map((reason) => (
                      <tr key={reason._id} className={`border-b border-slate-200/70 last:border-0 transition-colors hover:bg-slate-50/80 ${editingId === reason._id ? 'bg-amber-50/70' : ''}`}>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {reason.reasonText || reason.reason}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`${
                            (reason.role || reason.type) === 'driver' ? 'badge-info' :
                            (reason.role || reason.type) === 'user' ? 'badge-warning' :
                            'badge-neutral'
                          }`}>
                            {(reason.role || reason.type || "UNKNOWN").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleActive(reason)}
                            className={`cursor-pointer transition-opacity hover:opacity-80 ${
                              reason.isActive !== false ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {reason.isActive !== false ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditInit(reason)}
                              className="btn-icon hover:!text-gray-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(reason._id)}
                              className="btn-icon hover:!bg-rose-50 hover:!text-rose-600"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
