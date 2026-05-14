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
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-8 bg-white p-6 max-w-7xl rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Update Complaint</h2>
        <form onSubmit={handleSubmit}>
          {/* Ticket Status */}
          <label className="ml-2 mt-2 font-normal block">Ticket Status:</label>
          <select
            name="ticketStatus"
            value={formData.ticketStatus}
            onChange={handleChange}
            className="w-full h-12 mb-1 border rounded-xl pl-4 border-gray-500"
          >
            <option value="">Select Status</option>
            {validStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
          {apiError.ticketStatus && (
            <p className="text-red-500 text-sm ml-2">{apiError.ticketStatus}</p>
          )}

          {/* Admin Note */}
          <label className="ml-2 mt-5 font-normal block">Admin Note (Optional):</label>
          <textarea
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
            rows={5}
            className="w-full border rounded-xl p-3 border-gray-500"
            placeholder="Add an admin note if needed..."
          />

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-400 text-white py-2 px-4 rounded-xl hover:bg-gray-500 transition-colors duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-6 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-500"
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