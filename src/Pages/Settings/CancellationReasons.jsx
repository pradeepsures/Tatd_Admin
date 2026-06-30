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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">Cancellation Reasons</h2>
        <p className="text-sm opacity-80 mt-1">Manage the options shown when a user or driver cancels a ride</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ADD / EDIT FORM */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#03045E]">
                {editingId ? "Edit Reason" : "Add New Reason"}
              </h3>
              {editingId && (
                <button onClick={resetForm} className="text-gray-400 hover:text-red-500">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason Text</label>
                <textarea
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary resize-none"
                  placeholder="e.g. Passenger is unreachable"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role (Target)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="driver">Driver App</option>
                  <option value="user">User App</option>
                  <option value="both">Both Apps</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Visible in App)
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-opacity-90'}`}
              >
                {saving ? <LoderBtn /> : editingId ? "Update Reason" : "Add Reason"}
              </button>
            </form>
          </div>
        </div>

        {/* REASONS LIST */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#03045E]">Active Reasons</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 font-semibold text-gray-700">Reason</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 w-24">Role</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 w-24 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reasons.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">No Cancellation Reasons found</td>
                    </tr>
                  ) : (
                    reasons.map((reason) => (
                      <tr key={reason._id} className={`border-b hover:bg-gray-50 ${editingId === reason._id ? 'bg-orange-50' : ''}`}>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {reason.reasonText || reason.reason}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            (reason.role || reason.type) === 'driver' ? 'bg-blue-100 text-blue-700' : 
                            (reason.role || reason.type) === 'user' ? 'bg-purple-100 text-purple-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {(reason.role || reason.type || "UNKNOWN").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleActive(reason)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              reason.isActive !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {reason.isActive !== false ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditInit(reason)}
                              className="text-orange-500 hover:text-orange-700 p-1.5 rounded bg-orange-50 transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(reason._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded bg-red-50 transition-colors"
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
