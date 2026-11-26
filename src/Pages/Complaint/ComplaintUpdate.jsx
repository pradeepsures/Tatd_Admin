import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import toast from "react-hot-toast";
import { getSingleComplaint, updateComplaint } from "../../Services/ComplaintApi";
import Loader from "../../compoents/Loader";

const UpdateComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ticketStatus: "",
    adminNote: "",
  });
  const [apiError, setApiError] = useState({});
  const [loading, setLoading] = useState(false);

  const validStatuses = ["open", "in_progress", "resolved", "closed"];

  // Fetch complaint data
  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const res = await getSingleComplaint(id);
        if (res.status) {
          setFormData({
            ticketStatus: res.data.ticketStatus || "",
            adminNote: "",
          });
        } else {
          toast.error(res.message || "Complaint not found");
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch complaint");
      }
      setLoading(false);
    };

    fetchComplaint();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError({});

    const errors = {};
    if (!formData.ticketStatus) errors.ticketStatus = "Status is required.";

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await updateComplaint(id, formData);
      if (res.status) {
        toast.success("Complaint updated successfully!");
        navigate(-1); // go back to previous page
      } else {
        toast.error(res.message || "Failed to update complaint");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update complaint");
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card p-5 sm:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-4">
          <p className="section-label">Support</p>
          <h2 className="page-title mt-1">Update Complaint</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ticket Status */}
          <div className="max-w-xl">
          <label className="field-label">Ticket Status:</label>
          <select
            name="ticketStatus"
            value={formData.ticketStatus}
            onChange={handleChange}
            className="field"
          >
            <option value="">Select Status</option>
            {validStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
          {apiError.ticketStatus && (
            <p className="field-error">{apiError.ticketStatus}</p>
          )}
          </div>

          {/* Admin Note */}
          <div>
          <label className="field-label">Admin Note (Optional):</label>
          <textarea
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
            rows={5}
            className="field"
            placeholder="Add an admin note if needed..."
          />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateComplaint;