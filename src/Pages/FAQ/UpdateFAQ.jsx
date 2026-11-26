import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { updateFAQApi, getFAQByIdApi } from "../../Services/FaqApi";
import Breaker from "../../compoents/Breaker";

export default function UpdateFAQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState("en");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "",
  });

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await getFAQByIdApi(id, {
          ...formData,
          lang: selectedLang,
        });
        if (res?.status) {
          setFormData({
            question: res.data.question,
            answer: res.data.answer,
            type: res.data.type,
          });
        }
      } catch (err) {
        toast.error("Failed to load FAQ details");
      }
    };
    fetchFAQ();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateFAQApi(id, formData);
      if (res?.status) {
        toast.success("FAQ updated successfully!");
        navigate(-1);
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="page-shell">
      <Breaker />
    <div className="card p-5 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-label">FAQ</p>
          <h2 className="page-title">Update FAQ</h2>
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* <label className="text-xl font-medium text-gray-600">
            Language:
          </label> */}

          {/* <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-24 h-8 text-sm border rounded-md px-2 border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="pa">Punjabi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="gu">Gujarati</option>
            <option value="mr">Marathi</option>
          </select> */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question */}
        <div>
          <label className="field-label">
            Question
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            className="field"
          />
        </div>

        {/* Answer */}
        <div>
          <label className="field-label">
            Answer
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            rows="4"
            className="field"
          ></textarea>
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="field-label">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="field"
          >
            <option value="">Select Type</option>
            <option value="user">User</option>
            <option value="driver">Driver</option>
            {/* <option value="vastu">vastu</option>
            <option value="career">career</option>
            <option value="numerology">numerology</option> */}
          </select>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
        >
          Update FAQ
        </button>
        </div>
      </form>
    </div>
    </div>
  );
}
