import { useEffect, useState } from "react";
import { getAllCities } from "../../Services/CitiesApi";

const statusOptions = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["not_started", "Not Started"],
  ["driver_enroute", "Driver Enroute"],
  ["arrived", "Reached"],
  ["in_progress", "In Progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export default function TripBookingFilters({ filters, onChange, onReset }) {
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [cityError, setCityError] = useState("");

  // Text fields are kept in local "draft" state.
  // Parent / API is called ONLY on Enter or on the Search button click.
  const [draft, setDraft] = useState({
    search: filters.search || "",
    city: filters.city || "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCities = async () => {
      setCitiesLoading(true);
      setCityError("");

      try {
        const response = await getAllCities({ page: 1, rowsPerPage: 1000 });
        if (!isMounted) return;

        const cityList = response.data || [];
        setCities(cityList);

        const selectedCity = cityList.find(
          (city) => city._id === filters.city || city.name === filters.city
        );
        const selectedCityId = selectedCity?._id || "";

        if (filters.city !== selectedCityId) {
          onChange("city", selectedCityId);
        }
        setDraft((prev) => ({ ...prev, city: selectedCityId }));
      } catch (error) {
        if (isMounted) {
          setCityError(error instanceof Error ? error.message : "Failed to load cities");
        }
      } finally {
        if (isMounted) setCitiesLoading(false);
      }
    };

    fetchCities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync when parent changes/reset filters
  useEffect(() => {
    setDraft({
      search: filters.search || "",
      city: filters.city || "",
    });
  }, [filters.search, filters.city]);

  const applyTextFilters = () => {
    const search = draft.search.trim();
    const city = draft.city;

    if (search !== (filters.search || "")) onChange("search", search);
    if (city !== (filters.city || "")) onChange("city", city);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") applyTextFilters();
  };

  return (
    <div className="card card-pad">
      <div className="mb-4">
        <p className="section-label">Refine results</p>
        <h3 className="card-title mt-1">Search &amp; Filters</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Booking ID, user mobile, driver mobile"
          className="field !h-10"
          value={draft.search}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, search: event.target.value }))
          }
          onKeyDown={handleKeyDown}
        />
        <select
          aria-label="City"
          className="field !h-10"
          value={draft.city}
          disabled={citiesLoading || Boolean(cityError)}
          onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
          onKeyDown={handleKeyDown}
        >
          <option value="">{citiesLoading ? "Loading cities..." : "All Cities"}</option>
          {cities.map((city) => (
            <option key={city._id} value={city._id}>{city.name}</option>
          ))}
        </select>
        {cityError && <p className="text-sm text-rose-600">{cityError}</p>}
        <select
          className="field !h-10"
          value={filters.status || ""}
          onChange={(event) => onChange("status", event.target.value)}
        >
          <option value="">Status</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="field !h-10"
          value={filters.tripType || ""}
          onChange={(event) => onChange("tripType", event.target.value)}
        >
          <option value="">Trip Type</option>
          <option value="oneWay">One Way</option>
          <option value="roundTrip">Round Trip</option>
        </select>
        <select
          className="field !h-10"
          value={filters.paymentStatus || ""}
          onChange={(event) => onChange("paymentStatus", event.target.value)}
        >
          <option value="">Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className="field !h-10"
          value={filters.paymentMethod || ""}
          onChange={(event) => onChange("paymentMethod", event.target.value)}
        >
          <option value="">Payment Method</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="wallet">Wallet</option>
          <option value="razorpay">Razorpay</option>
        </select>
        <select
          className="field !h-10"
          value={filters.isPremium || ""}
          onChange={(event) => onChange("isPremium", event.target.value)}
        >
          <option value="">Premium Driver</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <input
          type="date"
          aria-label="Start date"
          className="field !h-10"
          value={filters.startDate || ""}
          onChange={(event) => onChange("startDate", event.target.value)}
        />
        <input
          type="date"
          aria-label="End date"
          className="field !h-10"
          value={filters.endDate || ""}
          onChange={(event) => onChange("endDate", event.target.value)}
        />
        <select
          className="field !h-10"
          value={filters.sortBy || "createdAt"}
          onChange={(event) => onChange("sortBy", event.target.value)}
        >
          <option value="createdAt">Sort: Created Date</option>
          <option value="startDate">Sort: Trip Start Date</option>
          <option value="totalAmount">Sort: Total Amount</option>
        </select>
        <select
          className="field !h-10"
          value={filters.sortOrder || "desc"}
          onChange={(event) => onChange("sortOrder", event.target.value)}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
        <button onClick={onReset} className="btn-secondary w-full sm:w-auto">
          Reset Filters
        </button>
        <button onClick={applyTextFilters} className="btn-primary w-full sm:w-auto">
          Search
        </button>
      </div>
    </div>
  );
}