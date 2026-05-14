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
    <div className="max-w-9xl mx-auto bg-white shadow-md p-6 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Create FAQ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question */}
        <div>
          <label className="block text-gray-700 mb-1">Question</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Answer */}
        <div>
          <label className="block text-gray-700 mb-1">Answer</label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
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
        <div className="flex justify-end items-center gap-4 mt-6">

          <button
            type="submit"
            className="bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-transform duration-500 py-3 px-6 rounded-2xl"
          >
            Create FAQ
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white py-3 px-6 rounded-2xl hover:bg-gray-600 transition-colors"
          >
            Back
          </button>

        </div>
        {/* <div className="flex justify-end items-center gap-4 mt-6">
        <button
          type="submit"
          className="bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-transform duration-500 py-3  px-6 mt-6 rounded-2xl"
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
  );
}
