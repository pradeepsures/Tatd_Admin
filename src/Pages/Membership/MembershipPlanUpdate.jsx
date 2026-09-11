import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MembershipPlanForm from "./MembershipPlanForm";
import { getMembershipPlanById, updateMembershipPlan } from "../../Services/MembershipPlanApi";
import Loader from "../../compoents/Loader";

export default function MembershipPlanUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await getMembershipPlanById(id);
        if (res?.status && res?.data) {
          // Parse features string if necessary (assuming backend might send it as string, else use as array)
          let features = res.data.features;
          if (typeof features === "string") {
            try {
              features = JSON.parse(features);
            } catch (e) {
              features = [];
            }
          }
          setInitialData({ ...res.data, features });
        } else {
          toast.error("Failed to load plan details");
          navigate("/home/membership");
        }
      } catch (error) {
        toast.error("Error fetching plan");
        navigate("/home/membership");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPlan();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      const res = await updateMembershipPlan(id, payload);
      if (res?.status) {
        toast.success("Membership Plan updated successfully!");
        navigate("/home/membership");
      } else {
        toast.error(res?.message || "Failed to update plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <MembershipPlanForm
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
      isEditMode={true}
    />
  );
}
