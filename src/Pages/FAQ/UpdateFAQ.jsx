import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { updateFAQApi, getFAQByIdApi } from "../../Services/FaqApi";

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
        const res = await getFAQByIdApi(id,{
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
    <div className="max-w-9xl    mx-auto bg-white shadow-lg rounded-2xl p-6">

      <div className="flex justify-between items-center mb-4">

      <h2 className="text-2xl font-bold mb-4 text-gray-700">Update FAQ</h2>

       <div className="mb-4 flex justify-end items-center gap-2">
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



      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Question
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Answer
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 border rounded-md"
          ></textarea>
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
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
        <button
          type="submit"
          className="w-full bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white font-bold hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-6 rounded-2xl"
        >
          Update FAQ
        </button>
      </form>
    </div>
  );
}
