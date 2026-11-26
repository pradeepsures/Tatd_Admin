import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Tag } from "antd";
import { getFAQByIdApi } from "../../Services/FaqApi";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import Breaker from "../../compoents/Breaker"

export default function FaqDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth, loading: authLoading } = useAuth();

  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Redirect properly
  useEffect(() => {
    if (!authLoading && !auth.user) {
      navigate("/login");
    }
  }, [authLoading, auth.user, navigate]);

  useEffect(() => {
    fetchFaq();
  }, [id]);

  const fetchFaq = async () => {
    try {
      setLoading(true);
      const result = await getFAQByIdApi(id);

      if (result?.status) {
        setFaq(result.data);
      } else {
        toast.error(result?.message || "Failed to fetch FAQ");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching FAQ");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) return <div className="flex justify-center py-14"><Spin size="large" /></div>;

  if (!faq) return null;

  return (
    <div className="page-shell">
      <Breaker/>
      <Card
        title="FAQ Details"
        bordered={false}
        className="card !rounded-[18px] !bg-white/70"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4 sm:col-span-2 lg:col-span-3">
            <h2 className="detail-label">
              Question
            </h2>
            <p className="detail-value">{faq.question}</p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4 sm:col-span-2 lg:col-span-3">
            <h2 className="detail-label">
              Answer
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line break-words">{faq.answer}</p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
            <h2 className="detail-label">
              Type
            </h2>
            <Tag color="gold" className="!mt-1 capitalize">
              {faq.type}
            </Tag>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
            <h2 className="detail-label">
              Priority
            </h2>
            <p className="detail-value">{faq.priority}</p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
            <h2 className="detail-label">
              Created Date
            </h2>
            <p className="detail-value">
              {new Date(faq.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}