import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MembershipPlanForm from "./MembershipPlanForm";
import { createMembershipPlan } from "../../Services/MembershipPlanApi";

export default function MembershipPlanCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      const res = await createMembershipPlan(payload);
      if (res?.status) {
        toast.success("Membership Plan created successfully!");
        navigate("/home/membership");
      } else {
        toast.error(res?.message || "Failed to create plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return <MembershipPlanForm onSubmit={handleSubmit} loading={loading} isEditMode={false} />;
}
