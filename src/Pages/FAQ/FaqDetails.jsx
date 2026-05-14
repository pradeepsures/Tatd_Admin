import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Tag } from "antd";
import { getFAQByIdApi } from "../../Services/FaqApi";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";

export default function FaqDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth, loading: authLoading } = useAuth();

  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Redirect properly
  useEffect(() => {
    if (!authLoading.profile && !auth.user) {
      navigate("/login");
    }
  }, [authLoading.profile, auth.user, navigate]);

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

  if (loading || authLoading.profile) return <Spin size="large" />;

  if (!faq) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card
        title="FAQ Details"
        bordered={false}
        className="shadow-xl rounded-xl"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Question
            </h2>
            <p className="text-gray-900 mt-1">{faq.question}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Answer
            </h2>
            <p className="text-gray-900 mt-1">{faq.answer}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Type
            </h2>
            <Tag color="purple" className="capitalize">
              {faq.type}
            </Tag>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Priority
            </h2>
            <p>{faq.priority}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Created Date
            </h2>
            <p>
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