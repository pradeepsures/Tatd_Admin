// PricingCreate.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Breaker from "../../compoents/Breaker";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { createPricingApi } from "../../Services/PricingApi";
import { getAllRegions } from "../../Services/RegionApi";
import { getAllSegment } from "../../Services/SegmentApi";

// Purely visual styles for react-select so it matches the glass field look
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    borderColor: state.isFocused ? "#d0d5dd" : "#e2e8f0",
    backgroundColor: state.isDisabled ? "rgba(241,245,249,0.8)" : "rgba(255,255,255,0.75)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(16,24,40,0.08)" : "none",
    fontSize: 14,
    "&:hover": { borderColor: state.isFocused ? "#d0d5dd" : "#cbd5e1" },
  }),
  menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden", zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected ? "#111827" : state.isFocused ? "rgba(16,24,40,0.08)" : "transparent",
    color: state.isSelected ? "#fff" : "#1f2937",
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

// ── Zod Schema (Updated to match your Mongoose schema) ─────────────────────
const baseDayNightSchema = z.object({
  baseFare: z.number().min(0, "Base fare is required"),
  perKmRate: z.number().min(0),
  perMinRate: z.number().min(0),
  minFare: z.number().min(0),
  cancellationFee: z.number().min(0).default(50),
});

const surgeWindowSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["time_based", "manual"]),
  fromHour: z.number().min(0).max(23).nullable().optional(),
  fromMin: z.number().min(0).max(59).nullable().optional(),
  toHour: z.number().min(0).max(23).nullable().optional(),
  toMin: z.number().min(0).max(59).nullable().optional(),
  isActive: z.boolean().optional(),
  multiplier: z.number().min(1).max(5, "Multiplier must be between 1 and 5"),
});

const hourlyPackageSchema = z.object({
  hours: z.number().min(1),
  includedKms: z.number().min(0),
  dayFare: z.number().min(0),
  nightFare: z.number().min(0),
  extraPerKm: z.number().min(0),
  extraPerMin: z.number().min(0),
});

const driverFareSchema = z.object({
  perKmRate: z.number().min(0),
  flatPerTrip: z.number().nullable().optional(),
  minGuarantee: z.number().min(0),
  allowancePerDay: z.number().min(0),
  allowancePerNight: z.number().min(0),
  overTimePerHour: z.number().min(0),
  holidayAllowance: z.number().min(0),
  tollIncluded: z.boolean().default(false),
});

const pricingSchema = z
  .object({
    region: z.string().min(1, "Region is required"),
    segment: z.string().min(1, "Segment is required"),
    bookingType: z.enum(["one_way", "round_trip", "hourly", "intercity"]),
    day: baseDayNightSchema,
    night: baseDayNightSchema,
    surgeActive: z.enum(["time_based", "manual", "none"]),
    surgeWindows: z.array(surgeWindowSchema).optional(),
    // hourlyPackage: hourlyPackageSchema.optional(),
    hourlyPackage: z.array(hourlyPackageSchema).optional(),
    driverFare: driverFareSchema.optional(),
    gstPercent: z.number().min(0).max(100).default(5),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.bookingType === "hourly" && (!data.hourlyPackage || data.hourlyPackage.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hourly package is required", path: ["hourlyPackage"] });
    }
    if (data.bookingType === "intercity" && !data.driverFare) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Driver fare is required for intercity", path: ["driverFare"] });
    }
  });

const PricingCreate = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [regionSearch, setRegionSearch] = useState("");
  const [segmentSearch, setSegmentSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      region: "",
      segment: "",
      bookingType: "one_way",
      surgeActive: "none",
      surgeWindows: [],
      gstPercent: 5,
      isActive: true,
      day: { baseFare: 50, perKmRate: 12, perMinRate: 1, minFare: 100, cancellationFee: 50 },
      night: { baseFare: 65, perKmRate: 15, perMinRate: 1.3, minFare: 120, cancellationFee: 60 },
      hourlyPackage: [],
      driverFare: null,
    },
  });

  const bookingType = watch("bookingType");
  const surgeActive = watch("surgeActive");

  // useFieldArray for Surge Windows
  const { fields, append, remove } = useFieldArray({
    control,
    name: "surgeWindows",
  });

  // Fetch Regions with search
  useEffect(() => {

    const fetchRegions = async () => {
      try {
        const result = await getAllRegions({ page: 1, rowsPerPage: 100, searchQuery: regionSearch });
        setRegions(result.data || result.regions || result || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRegions();
  }, [regionSearch]);

  // Fetch Segments
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const result = await getAllSegment({ page: 1, rowsPerPage: 100 });
        setSegments(result.data || result.segments || result || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSegments();
  }, []);

  // Reset conditional fields when bookingType changes
  useEffect(() => {
    if (bookingType === "hourly") {
      setValue("hourlyPackage", [
        {
          hours: 2,
          includedKms: 20,
          dayFare: 400,
          nightFare: 500,
          extraPerKm: 12,
          extraPerMin: 1.5,
        }
      ]);
      setValue("driverFare", null);
    } else if (bookingType === "intercity") {
      setValue("driverFare", {
        perKmRate: 0,
        flatPerTrip: null,
        minGuarantee: 0,
        allowancePerDay: 0,
        allowancePerNight: 0,
        overTimePerHour: 0,
        holidayAllowance: 0,
        tollIncluded: false,
      });
      setValue("hourlyPackage", []);
    } else {
      setValue("hourlyPackage", []);
      setValue("driverFare", undefined);
    }
  }, [bookingType, setValue]);

  const {
    fields: hourlyFields,
    append: appendHourly,
    remove: removeHourly,
  } = useFieldArray({
    control,
    name: "hourlyPackage",
  });

  // Disable surge windows when "none" is selected
  useEffect(() => {
    if (surgeActive === "none") {
      setValue("surgeWindows", []);
    }
  }, [surgeActive, setValue]);

  const handleClear = () => {
    reset({
      region: "",
      segment: "",
      bookingType: "one_way",
      surgeActive: "none",
      surgeWindows: [],
      gstPercent: 5,
      isActive: true,
      day: { baseFare: 50, perKmRate: 12, perMinRate: 1, minFare: 100, cancellationFee: 50 },
      night: { baseFare: 65, perKmRate: 15, perMinRate: 1.3, minFare: 120, cancellationFee: 60 },
      hourlyPackage: [],
      driverFare: null,
    });
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };

      // Clean payload based on bookingType
      if (data.bookingType !== "hourly") delete payload.hourlyPackage;
      if (data.bookingType !== "intercity") delete payload.driverFare;

      // Force empty surgeWindows if none
      if (data.surgeActive === "none") {
        payload.surgeWindows = [];
      }

      const result = await createPricingApi(payload);
      if (result.success || result._id) {
        toast.success("Pricing created successfully!");
        // reset();
        navigate("/home/pricing");
      } else {
        toast.error(result.message || "Failed to create pricing");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Breaker />
      <div className="card p-5 sm:p-8">
      <div className="mb-8 border-b border-slate-200/70 pb-5">
        <p className="section-label">Pricing</p>
        <h1 className="page-title mt-1">Create New Pricing</h1>
      </div>

      {/* <form onSubmit={handleSubmit(onSubmit)} className="space-y-10"> */}
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("FORM ERRORS:", errors);
        }
        )} className="space-y-10" >
        {/* 1. Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Region */}
          <div>
            <label className="field-label">Region *</label>

            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select
                  options={regions.map((r) => ({
                    label: r.name,
                    value: r._id,
                  }))}
                  value={regions
                    .map((r) => ({ label: r.name, value: r._id }))
                    .find((opt) => opt.value === field.value) || null}
                  onChange={(selected) => field.onChange(selected?.value)}
                  placeholder="Search & Select Region"
                  styles={selectStyles}
                />
              )}
            />

            {errors.region && (
              <p className="field-error">
                {errors.region.message}
              </p>
            )}
          </div>

          {/* Segment */}
          <div>
            <label className="field-label">Segment *</label>

            <Controller
              name="segment"
              control={control}
              render={({ field }) => (
                <Select
                  options={segments.map((s) => ({
                    label: s.name,
                    value: s._id,
                  }))}
                  value={segments
                    .map((s) => ({ label: s.name, value: s._id }))
                    .find((opt) => opt.value === field.value) || null}
                  onChange={(selected) => field.onChange(selected?.value)}
                  placeholder="Search & Select Segment"
                  styles={selectStyles}
                />
              )}
            />

            {errors.segment && (
              <p className="field-error">
                {errors.segment.message}
              </p>
            )}
          </div>

          {/* Booking Type */}
          <div>
            <label className="field-label">Booking Type *</label>
            <select
              {...register("bookingType")}
              className="field"
            >
              <option value="one_way">One Way</option>
              <option value="round_trip">Round Trip</option>
              <option value="hourly">Hourly</option>
              <option value="intercity">Intercity</option>
            </select>
          </div>
        </div>

        {/* 2. Day & Night Pricing */}
        <div className="grid grid-cols-1 gap-8">
          {["day"].map((timeSlot) => (
            <div key={timeSlot}>
              <h2 className="card-title mb-4">
                {timeSlot === "day" ? "Day Pricing" : "Night Pricing"}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {["baseFare", "perKmRate", "perMinRate", "minFare", "cancellationFee"].map((field) => (
                  <div key={field}>
                    <label className="field-label capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`${timeSlot}.${field}`, { valueAsNumber: true })}
                      className="field"
                    />
                    {errors[timeSlot]?.[field] && (
                      <p className="field-error">{errors[timeSlot][field].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ✅Night Fare Full Width */}
        <div>
          <label className="field-label capitalize">Night Fare</label>
          <input
            type="number"
            step="0.01"
            {...register("nightFare", { valueAsNumber: true })}
            className="field"
          />
          {errors.nightFare && (
            <p className="field-error">
              {errors.nightFare.message}
            </p>
          )}
        </div>

        {/* 3. Surge Active */}

        {/* <div>
          <h2 className="text-xl font-semibold mb-2 mt-5">Surge Settings</h2>
          <select
            {...register("surgeActive")}
            className="field"
          >
            <option value="none">None</option>
            <option value="time_based">Time Based</option>
            <option value="manual">Manual</option>
          </select>
        </div> */}

        {/* 4. Surge Windows */}
        {/* <div>
          <div className="flex justify-between items-center mb-4 mt-5">
            <h2 className="text-xl font-semibold">Surge Windows</h2>
            {surgeActive !== "none" && (
              <button
                type="button"
                onClick={() => append({
                  label: "",
                  type: "time_based",
                  fromHour: null,
                  fromMin: 0,
                  toHour: null,
                  toMin: 0,
                  isActive: false,
                  multiplier: 1.5,
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Surge Window
              </button>
            )}
          </div>

          <div className={`p-6 rounded-xl ${surgeActive === "none" ? "bg-gray-100" : "bg-gray-50"}`}>
            {surgeActive === "none" && (
              <p className="text-gray-500 text-center py-8">Surge is disabled. No windows will be saved.</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="border p-6 rounded-xl bg-white mb-6 relative">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="field-label capitalize">Label</label>
                    <input
                      {...register(`surgeWindows.${index}.label`)}
                      className="field"
                      placeholder="Morning Rush"
                    />
                  </div>

                  <div>
                    <label className="field-label capitalize">Type</label>
                    <select
                      {...register(`surgeWindows.${index}.type`)}
                      className="field"
                    >
                      <option value="time_based">Time Based</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label capitalize">Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`surgeWindows.${index}.multiplier`, { valueAsNumber: true })}
                      className="field"
                    />
                  </div>

                 
                  {watch(`surgeWindows.${index}.type`) === "time_based" && (
                    <>
                      <div>
                        <label className="field-label capitalize">From Hour</label>
                        <input
                          type="number"
                          {...register(`surgeWindows.${index}.fromHour`, { valueAsNumber: true })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className="field-label capitalize">From Min</label>
                        <input
                          type="number"
                          {...register(`surgeWindows.${index}.fromMin`, { valueAsNumber: true })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className="field-label capitalize">To Hour</label>
                        <input
                          type="number"
                          {...register(`surgeWindows.${index}.toHour`, { valueAsNumber: true })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className="field-label capitalize">To Min</label>
                        <input
                          type="number"
                          {...register(`surgeWindows.${index}.toMin`, { valueAsNumber: true })}
                          className="field"
                        />
                      </div>

                    </>
                  )}

                
                  {watch(`surgeWindows.${index}.type`) === "manual" && (
                    <div className="col-span-full">
                      <Controller
                        name={`surgeWindows.${index}.isActive`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={field.value} onChange={field.onChange} />
                            Is Active (Manual Surge)
                          </label>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* 5. Hourly Package */}
        {bookingType === "hourly" && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="card-title">Hourly Packages</h2>

              <button
                type="button"
                onClick={() =>
                  appendHourly({
                    hours: 2,
                    includedKms: 20,
                    dayFare: 400,
                    nightFare: 500,
                    extraPerKm: 12,
                    extraPerMin: 1.5,
                  })
                }
                className="btn-secondary w-full sm:w-auto"
              >
                + Add Package
              </button>
            </div>

            {hourlyFields.map((item, index) => (
              <div key={item.id} className="relative mb-4 rounded-2xl border border-slate-200/80 bg-white/60 p-5 sm:p-6">

                <button
                  type="button"
                  onClick={() => removeHourly(index)}
                  className="btn-icon absolute right-3 top-3 !text-rose-500 hover:!bg-rose-50"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    "hours",
                    "includedKms",
                    "dayFare",
                    "nightFare",
                    "extraPerKm",
                    "extraPerMin",
                  ].map((field) => (
                    <div key={field}>
                      <label className="field-label capitalize">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>

                      <input
                        type="number"
                        step="0.01"
                        {...register(`hourlyPackage.${index}.${field}`, {
                          valueAsNumber: true,
                        })}
                        className="field"
                      />
                    </div>
                  ))}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. Driver Fare (Intercity) */}
        {bookingType === "intercity" && (
          <div>
            <h2 className="card-title mb-4">Driver Fare (Intercity)</h2>
            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-white/60 p-5 sm:grid-cols-2 sm:p-6">
              {[
                "perKmRate", "flatPerTrip", "minGuarantee", "allowancePerDay",
                "allowancePerNight", "overTimePerHour", "holidayAllowance",
              ].map((field) => (
                <div key={field}>
                  <label className="field-label capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`driverFare.${field}`, { valueAsNumber: true })}
                    className="field"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <Controller
                  name="driverFare.tollIncluded"
                  control={control}
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={field.onChange}
                      />
                      Toll Included in Driver Fare
                    </label>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. GST & Status (at the bottom) */}
        <div className="grid grid-cols-1 gap-6 border-t border-slate-200/70 pt-8 md:grid-cols-3">
          <div>
            <label className="field-label">GST Percent (%)</label>
            <input
              type="number"
              {...register("gstPercent", { valueAsNumber: true })}
              className="field"
            />
          </div>

          <div className="flex items-center gap-3 md:pt-7">
            <input type="checkbox" {...register("isActive")} id="isActive" className="h-4 w-4 cursor-pointer accent-amber-500" />
            <label htmlFor="isActive" className="cursor-pointer text-sm font-semibold text-slate-700">
              Is Active
            </label>
          </div>
        </div>

        {/* button */}

        <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row-reverse sm:justify-start">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? "Creating Pricing..." : "Create Pricing"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary w-full sm:w-auto"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost w-full sm:w-auto"
          >
            Back
          </button>

        </div>

      </form>
      </div>
    </div>
  );
};

export default PricingCreate;