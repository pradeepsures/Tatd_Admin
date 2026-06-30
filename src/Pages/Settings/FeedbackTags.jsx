import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getFeedbackTags, createFeedbackTag, deleteFeedbackTag } from "../../Services/SettingsApi";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function FeedbackTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTagText, setNewTagText] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("");
  const [newTagType, setNewTagType] = useState("positive");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await getFeedbackTags();
      if (res?.status) {
        setTags(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load Feedback Tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTagText.trim()) return toast.error("Tag text is required");
    
    try {
      setSaving(true);
      const payload = {
        text: newTagText,
        emoji: newTagEmoji,
        type: newTagType,
      };
      const res = await createFeedbackTag(payload);
      if (res?.status) {
        toast.success("Feedback Tag added");
        setNewTagText("");
        setNewTagEmoji("");
        fetchTags();
      }
    } catch (error) {
      toast.error("Failed to create Feedback Tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    try {
      const res = await deleteFeedbackTag(id);
      if (res?.status) {
        toast.success("Feedback Tag deleted");
        fetchTags();
      }
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  if (loading && tags.length === 0) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">Feedback Tags</h2>
        <p className="text-sm opacity-80 mt-1">Manage tags drivers and users see after a ride</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ADD FORM */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#03045E]">Add New Tag</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Text</label>
                <input
                  type="text"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="e.g. Excellent Driving"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji (Optional)</label>
                <input
                  type="text"
                  value={newTagEmoji}
                  onChange={(e) => setNewTagEmoji(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="🚗"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                {saving ? <LoderBtn /> : "Add Tag"}
              </button>
            </form>
          </div>
        </div>

        {/* TAG LIST */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 text-[#03045E]">Active Tags</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Emoji</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Text</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500">No Feedback Tags found</td>
                    </tr>
                  ) : (
                    tags.map((tag) => (
                      <tr key={tag._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-xl">{tag.emoji}</td>
                        <td className="py-3 px-4 font-medium">{tag.text}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${tag.type === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {tag.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tag._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5 mx-auto" />
                          </button>
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
