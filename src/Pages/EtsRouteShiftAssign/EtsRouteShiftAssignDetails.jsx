import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "antd";
import Loader from "../../compoents/Loader";
import toast from "react-hot-toast";
import { getEtsRouteShiftAssignById } from "../../Services/EtsRouteShiftaAssign";

export default function EtsRouteShiftAssignView() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await getEtsRouteShiftAssignById(id);

        if (res?.status) {
          setData(res.data);
        }
      } catch (err) {
        toast.error("Failed to fetch details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">Assignment Details</h2>

      {/* ✅ MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔹 ROUTE CARD */}
        <Card className="rounded-xl shadow">
          <h3 className="font-semibold mb-4">Route Info</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Route Name</p>
              <p className="font-semibold">{data?.etsRoute?.name || "-"}</p>
            </div>
          </div>
        </Card>

        {/* 🔹 DRIVER CARD */}
        <Card className="rounded-xl shadow p-4">

          <h3 className="font-semibold mb-4">Driver Info</h3>

          <div className="grid grid-cols-2 gap-6 items-center">

            {/* LEFT → PROFILE */}
            <div className="flex justify-center">
              <img
                src={data?.driver?.profilePic}
                alt="driver"
                className="w-20 h-20 rounded-full border object-cover"
              />
            </div>

            {/* RIGHT → DETAILS */}
            <div className="space-y-3">

              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold">{data?.driver?.name || "-"}</p>
              </div>

              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold">{data?.driver?.phone || "-"}</p>
              </div>

            </div>

          </div>

        </Card>


        {/* 🔹 VEHICLE CARD */}
        <Card className="rounded-xl shadow">
          <h3 className="font-semibold mb-4">Vehicle Info</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Brand</p>
              <p className="font-semibold">{data?.vehicle?.brand}</p>
            </div>

            <div>
              <p className="text-gray-500">Model</p>
              <p className="font-semibold">{data?.vehicle?.model}</p>
            </div>

            <div>
              <p className="text-gray-500">Color</p>
              <p className="font-semibold">{data?.vehicle?.color}</p>
            </div>

            <div>
              <p className="text-gray-500">Car Number</p>
              <p className="font-semibold">{data?.vehicle?.carNumber}</p>
            </div>
          </div>
        </Card>

        {/* 🔹 SHIFT CARD */}
        <Card className="rounded-xl shadow">
          <h3 className="font-semibold mb-4">EtsRouteShift Info</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Shift Name</p>
              <p className="font-semibold">{data?.etsRouteShift?.shiftName}</p>
            </div>

            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold">₹ {data?.etsRouteShift?.price}</p>
            </div>
          </div>
        </Card>

      </div>

      {/* 🔹 STOPPAGES FULL WIDTH */}
      <div className="mt-5">
        <Card className="rounded-xl shadow mt-6">
          <h3 className="font-semibold mb-4">EtsRouteShif Stoppages</h3>

          {data?.etsRouteShift?.stoppageTimes?.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {data.etsRouteShift.stoppageTimes.map((stop, index) => (
                <div key={stop._id} className="border p-4 rounded-lg bg-gray-50">

                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">
                      #{index + 1}
                    </h4>
                  </div>


                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      Name: <span className="font-semibold">{stop.name}</span>
                    </p>

                    <p>
                      Address: <span className="font-semibold">{stop.address}</span>
                    </p>


                    <p>
                      Arrival: <span className="font-semibold">{stop.arrivalTime}</span>
                    </p>

                    <p>
                      Departure: <span className="font-semibold">{stop.departureTime}</span>
                    </p>

                    <p>
                      Lat: <span className="font-semibold">{stop.lat}</span>
                    </p>

                    <p>
                      Lng: <span className="font-semibold">{stop.lng}</span>
                    </p>

                    <p>
                      Order: <span className="font-semibold">{stop.order}</span>
                    </p>

                    <p>
                      Distance: <span className="font-semibold">{stop.distance}</span>
                    </p>


                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No stoppages available</p>
          )}

          <p className="mt-4">
            Date: <span className="font-semibold">
              {data?.date ? new Date(data.date).toLocaleDateString() : "-"}
            </span>
          </p>

        </Card>
      </div>


      {/* 🔹 BACK BUTTON */}
      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-5 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

    </div>
  );
}