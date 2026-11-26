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
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Feedback Tags</h2>
          <p className="page-subtitle">Manage tags drivers and users see after a ride</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        
        {/* ADD FORM */}
        <div className="lg:col-span-1">
          <div className="card card-pad">
            <h3 className="card-title mb-5 border-b border-slate-200/70 pb-4">Add New Tag</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              
              <div>
                <label className="field-label">Tag Text</label>
                <input
                  type="text"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  className="field"
                  placeholder="e.g. Excellent Driving"
                  required
                />
              </div>

              <div>
                <label className="field-label">Emoji (Optional)</label>
                <input
                  type="text"
                  value={newTagEmoji}
                  onChange={(e) => setNewTagEmoji(e.target.value)}
                  className="field"
                  placeholder="🚗"
                />
              </div>

              <div>
                <label className="field-label">Type</label>
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value)}
                  className="field"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? <LoderBtn /> : "Add Tag"}
              </button>
            </form>
          </div>
        </div>

        {/* TAG LIST */}
        <div className="lg:col-span-2">
          <div className="card card-pad">
            <h3 className="card-title mb-4">Active Tags</h3>

            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70">
              <table className="w-full min-w-[480px] text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#c99a2e]/40 bg-[#171b25] text-[11px] font-semibold uppercase tracking-wider text-white/75">
                    <th className="py-3 px-4 text-xs font-semibold text-white/75">Emoji</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75">Text</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold text-white/75 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-14 text-center text-slate-400">No Feedback Tags found</td>
                    </tr>
                  ) : (
                    tags.map((tag) => (
                      <tr key={tag._id} className="border-b border-slate-200/70 last:border-0 transition-colors hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-xl">{tag.emoji}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{tag.text}</td>
                        <td className="py-3 px-4">
                          <span className={`capitalize ${tag.type === 'positive' ? 'badge-success' : 'badge-danger'}`}>
                            {tag.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tag._id)}
                            className="btn-icon hover:!bg-rose-50 hover:!text-rose-600"
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
