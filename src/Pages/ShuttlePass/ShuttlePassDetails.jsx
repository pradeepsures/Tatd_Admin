import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";

import { getShuttlePassById } from "../../Services/ShuttlePassApi";

const ShuttlePassView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getShuttlePassById(id);

        if (res?.status) {
          setData(res.data);
        }
      } catch (err) {
        toast.error("Failed to load shuttle pass");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return <p className="p-6">No Data Found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Breaker />

      <div className="max-w-5xl mx-auto mt-4">
        <h1 className="text-3xl font-bold mb-6">
          Shuttle Pass <span className="text-primary">Details</span>
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-8">

          {/* ✅ IMAGE */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Thumbnail</h2>
            {data.thumbImage ? (
              <img
                src={data.thumbImage}
                alt={data.name}
                className="w-60 h-40 object-cover rounded-lg shadow"
              />
            ) : (
              <p className="text-gray-500">No image</p>
            )}
          </div>

          {/* ✅ BASIC INFO */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <Detail label="Name" value={data.name} />
              <Detail label="Short Description" value={data.shortDescription} />
              <Detail label="Ride Count" value={data.rideCount} />
              <Detail label="Validity Days" value={`${data.validityDays} Days`} />

              <Detail
                label="Status"
                value={
                  data.isActive ? (
                    <span className="text-green-600 font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inactive
                    </span>
                  )
                }
              />

              <Detail
                label="Created At"
                value={new Date(data.createdAt).toLocaleString()}
              />

              <Detail
                label="Updated At"
                value={new Date(data.updatedAt).toLocaleString()}
              />
            </div>
          </div>

          {/* ✅ DESCRIPTION */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700">
              {data.description || "No description"}
            </p>
          </div>

          {/* ✅ BENEFITS */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Benefits</h2>

            {data.benefits?.length ? (
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {data.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No benefits listed</p>
            )}
          </div>

          {/* ✅ BACK BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-white px-6 py-3 rounded-xl hover:scale-105 transition"
            >
              Back
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ✅ REUSABLE DETAIL
const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800">
      {value || "Not provided"}
    </p>
  </div>
);

export default ShuttlePassView;