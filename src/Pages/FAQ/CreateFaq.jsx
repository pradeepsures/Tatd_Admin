import React, { useState } from "react";
import toast from "react-hot-toast";
import { createFaqApi } from "../../Services/FaqApi"; // apne path se import kare
import { useNavigate } from "react-router-dom";
export default function CreateFAQ() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createFaqApi(formData);
      if (res.status) {
        toast.success("FAQ created successfully!");
        navigate(-1); // Redirect to FAQ list page
        setFormData({ question: "", answer: "", type: "" });
      } else {
        toast.error(res.message || "Failed to create FAQ");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="page-shell">
    <div className="card p-5 sm:p-8">
      <div className="mb-6 border-b border-slate-200/70 pb-5">
        <p className="section-label">FAQ</p>
        <h2 className="page-title">Create FAQ</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question */}
        <div>
          <label className="field-label">Question</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="field"
            required
          />
        </div>

        {/* Answer */}
        <div>
          <label className="field-label">Answer</label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            rows="4"
            className="field"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="field-label">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="field"
            required
          >
            <option value="">Select Type</option>
            <option value="user">User</option>
            <option value="driver">Driver</option>
            {/* <option value="love">Love</option>
            <option value="vastu">Vastu</option>
            <option value="career">Career</option>
            <option value="numerology">Numerology</option> */}
          </select>
        </div>

        {/* Submit */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row-reverse sm:justify-start">

          <button
            type="submit"
            className="btn-primary w-full sm:w-auto"
          >
            Create FAQ
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary w-full sm:w-auto"
          >
            Back
          </button>

        </div>
        {/* <div className="flex justify-end items-center gap-4 mt-6">
        <button
          type="submit"
          className="bg-primary text-white font-bold active:scale-95 transition-transform duration-500 py-3  px-6 mt-6 rounded-2xl"
        >
          Create FAQ
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white py-3 px-6 rounded-2xl ml-4 hover:bg-gray-600 transition-colors"
        >
          Back
        </button>

        </div> */}
      </form>
    </div>
    </div>
  );
}
