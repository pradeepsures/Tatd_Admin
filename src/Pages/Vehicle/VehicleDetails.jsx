import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import toast from "react-hot-toast";
import { getVehicleById } from "../../Services/VehicleApi"; // assuming you have this function
import { format } from "date-fns"; // optional - for nice date formatting

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth, loading: authLoading } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const result = await getVehicleById(id);
        if (result?.status && result?.data) {
          setVehicle(result.data);
        } else {
          toast.error(result?.message || "Failed to load vehicle details");
          setError("Vehicle not found");
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        toast.error("Error loading vehicle details");
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && auth.user) {
      fetchVehicle();
    }
  }, [id, authLoading, auth.user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  if (authLoading || loading) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (error || !vehicle) {
    return (
      <div className="card mx-auto mt-6 max-w-md p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Error</h2>
        <p className="mt-1 text-sm text-rose-600">{error || "Vehicle not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary mt-5"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div className="min-w-0">
          <p className="section-label">Vehicle</p>
          <h1 className="page-title break-words">
            Vehicle Details: {vehicle.carNumber || "—"}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary w-full sm:w-auto"
        >
          Back 
        </button>
      </div>

      {/* Main Info Card */}
      <div className="card card-pad">
        <h2 className="card-title mb-5 border-b border-slate-200/70 pb-3">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Vehicle Number" value={vehicle.carNumber} />
          <DetailItem label="Brand" value={vehicle.brand} />
          <DetailItem label="Model" value={vehicle.model} />
          <DetailItem label="Year" value={vehicle.year} />
          <DetailItem label="Color" value={vehicle.color} />
          <DetailItem label="Fuel Type" value={vehicle.fuelType?.toUpperCase()} />
          <DetailItem label="Capacity" value={`${vehicle.capacity || "—"} Seats`} />
          <DetailItem label="Boot Space" value={vehicle.bootSpace} />
          <DetailItem
            label="Status"
            value={
              <span
                className={
                  vehicle.isActive
                    ? "badge-success"
                    : "badge-danger"
                }
              >
                {vehicle.isActive ? "Active" : "Inactive"}
              </span>
            }
          />
          <DetailItem label="Created At" value={formatDate(vehicle.createdAt)} />
        </div>
      </div>

      {/* Driver & Segment */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="card-title mb-5 border-b border-slate-200/70 pb-3">
            Chauffeur Information
          </h2>
          <div className="space-y-4">
            <DetailItem label="Name" value={vehicle.driver?.name} />
            <DetailItem label="Phone" value={vehicle.driver?.phone} />
            <DetailItem label="Email" value={vehicle.driver?.email} />
            <DetailItem label="Driver ID" value={vehicle.driver?._id} small />
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title mb-5 border-b border-slate-200/70 pb-3">
            Segment Information
          </h2>
          <div className="space-y-4">
            <DetailItem label="Name" value={vehicle.segment?.name} />
            <DetailItem label="Description" value={vehicle.segment?.description} />
            <DetailItem label="Max Capacity" value={`${vehicle.segment?.maxCapacity} Seats`} />
            {vehicle.segment?.image && (
              <div>
                <p className="detail-label mb-1.5">Segment Image</p>
                <img
                  src={vehicle.segment.image}
                  alt="Segment"
                  className="h-32 w-full rounded-xl object-cover ring-1 ring-black/5"
                  onError={(e) => (e.target.src = "/assets/placeholder.png")}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="card card-pad">
        <h2 className="card-title mb-5 border-b border-slate-200/70 pb-3">
          Vehicle Images & Documents
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicle.carImage?.length > 0 && (
            <ImageCard title="Vehicle Images" images={vehicle.carImage} />
          )}
          {vehicle.documentImage?.length > 0 && (
            <ImageCard title="Document Images" images={vehicle.documentImage} />
          )}
          {vehicle.certificatePhoto && (
            <ImageCard title="Certificate Photo" images={[vehicle.certificatePhoto]} />
          )}
          {vehicle.rcFrontPhoto && (
            <ImageCard title="RC Front" images={[vehicle.rcFrontPhoto]} />
          )}
          {vehicle.rcBackPhoto && (
            <ImageCard title="RC Back" images={[vehicle.rcBackPhoto]} />
          )}
        </div>

        {(!vehicle.carImage?.length &&
          !vehicle.documentImage?.length &&
          !vehicle.certificatePhoto &&
          !vehicle.rcFrontPhoto &&
          !vehicle.rcBackPhoto) && (
          <p className="py-14 text-center text-slate-400">No images available</p>
        )}
      </div>

      {/* Documents & Expiry Dates */}
      <div className="card card-pad">
        <h2 className="card-title mb-5 border-b border-slate-200/70 pb-3">
          Documents & Expiry Information
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Certificate Number" value={vehicle.certificateNumber} />
          <DetailItem label="Certificate Expiry" value={formatDate(vehicle.certificateExpiry)} />
          <DetailItem label="Insurance Expiry" value={formatDate(vehicle.insuranceExpiry)} />
          <DetailItem label="Pollution Expiry" value={formatDate(vehicle.pollutionExpiry)} />
          <DetailItem label="RC Expiry" value={formatDate(vehicle.rcExpeiry)} /> {/* note: typo in backend */}
        </div>
      </div>
    </div>
  );
}

// Reusable components
const DetailItem = ({ label, value, small = false }) => (
  <div>
    <p className="detail-label">{label}</p>
    <p className={`detail-value ${small ? "!text-xs font-mono" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const ImageCard = ({ title, images }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/60">
    <div className="border-b border-slate-200/70 bg-slate-50/80 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
      {title}
    </div>
    <div className="p-3 grid grid-cols-1 gap-3">
      {images.map((img, idx) => (
        <div key={idx} className="overflow-hidden rounded-xl ring-1 ring-black/5">
          <img
            src={img}
            alt={`${title} ${idx + 1}`}
            className="h-40 w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            onError={(e) => {
              e.target.src = "/assets/placeholder.png";
              e.target.alt = "Image not available";
            }}
          />
        </div>
      ))}
    </div>
  </div>
);