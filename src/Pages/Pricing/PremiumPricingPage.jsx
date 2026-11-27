
import { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Pagination } from "@mui/material";
import { Modal } from "antd";
import { PlusIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { useAuth } from "../../auth/AuthContext";
import { GenericApi } from "../../Services/GenericApi";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Dropdown } from "antd";                                        


const PREMIUM_PRICE_ENDPOINT = "/api/admin/premiumPrice";
const CITIES_ENDPOINT = "/api/admin/cities";
const ROWS_PER_PAGE = 10;

const createEmptyForm = () => ({
  city: "",
  title: "",
  description: "",
  features: [""],
  prices: {
    hourly: "",
    outstation: "",
    monthly: "",
    weekly: "",
  },
});

const getCityName = (city) => {
  if (city && typeof city === "object") return city.name || "—";
  return city || "—";
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 10,
    borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(148,163,184,0.2)"
      : "none",
    "&:hover": { borderColor: "#94a3b8" },
  }),
  menu: (base) => ({ ...base, zIndex: 30 }),
};

export default function PremiumPricingPage() {
  const { auth, hasPermission, loading: authLoading } = useAuth();

  const [cities, setCities] = useState([]);
  const [pricingRecords, setPricingRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);

  // Permissions
  const canCreate = hasPermission("PremiumPricing", "create");
  const canUpdate = hasPermission("PremiumPricing", "update");
  const canDelete = hasPermission("PremiumPricing", "delete");

  const isEditing = Boolean(editingId);

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city._id,
        label: city.name,
      })),
    [cities]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(pricingRecords.length / ROWS_PER_PAGE)
  );

  const visibleRecords = pricingRecords.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  // READ: Fetch pricing and cities
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [pricingResult, cityResult] = await Promise.all([
        GenericApi.fetchList(PREMIUM_PRICE_ENDPOINT, {
          page: 1,
          rowsPerPage: 1000,
        }),
        GenericApi.fetchList(CITIES_ENDPOINT, {
          page: 1,
          rowsPerPage: 1000,
        }),
      ]);

      if (!pricingResult?.status) {
        throw new Error(
          pricingResult?.message || "Failed to load premium pricing."
        );
      }

      if (!cityResult?.status) {
        throw new Error(
          cityResult?.message || "Failed to load cities."
        );
      }

      setPricingRecords(pricingResult.data || []);
      setCities(cityResult.data || []);
    } catch (error) {
      console.error("Error loading premium pricing:", error);
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && auth.user) {
      loadData();
    }
  }, [authLoading, auth.user, loadData]);

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setFormData(createEmptyForm());
    setModalOpen(true);
  };

  // UPDATE: Open edit modal with existing data
  const openEditModal = (record) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update.");
      return;
    }

    setEditingId(record._id);

    setFormData({
      city:
        typeof record.city === "object"
          ? record.city?._id || ""
          : record.city || "",

      title: record.title || "",
      description: record.description || "",

      features:
        Array.isArray(record.features) && record.features.length
          ? [...record.features]
          : [""],

      prices: {
        hourly: record.prices?.hourly ?? "",
        outstation: record.prices?.outstation ?? "",
        monthly: record.prices?.monthly ?? "",
        weekly: record.prices?.weekly ?? "",
      },
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitLoading) return;

    setModalOpen(false);
    setEditingId(null);
    setFormData(createEmptyForm());
  };

  // Update pricing fields
  const updatePrice = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      prices: {
        ...previous.prices,
        [key]: value,
      },
    }));
  };

  // Update features
  const updateFeature = (index, value) => {
    setFormData((previous) => ({
      ...previous,
      features: previous.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  // Add feature
  const addFeature = () => {
    setFormData((previous) => ({
      ...previous,
      features: [...previous.features, ""],
    }));
  };

  // Remove feature
  const removeFeature = (index) => {
    setFormData((previous) => ({
      ...previous,
      features: previous.features.filter(
        (_, featureIndex) => featureIndex !== index
      ),
    }));
  };

  // CREATE / UPDATE
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isEditing && !canUpdate) {
      toast.error("You don't have permission to update.");
      return;
    }

    if (!isEditing && !canCreate) {
      toast.error("You don't have permission to create.");
      return;
    }

    const features = formData.features
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!formData.city) {
      toast.error("Select a city.");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Enter a title and description.");
      return;
    }

    if (!features.length) {
      toast.error("Add at least one feature.");
      return;
    }

    const prices = Object.fromEntries(
      Object.entries(formData.prices).map(([key, value]) => [
        key,
        Number(value),
      ])
    );

    if (
      Object.values(prices).some(
        (price) => !Number.isFinite(price) || price < 0
      )
    ) {
      toast.error("Enter a valid non-negative price for each plan.");
      return;
    }

    const payload = {
      city: formData.city,
      title: formData.title.trim(),
      description: formData.description.trim(),
      features,
      prices,
    };

    setSubmitLoading(true);

    try {
      let result;

      if (isEditing) {
        // UPDATE API
        result = await GenericApi.updateRecord(
          PREMIUM_PRICE_ENDPOINT,
          editingId,
          payload
        );
      } else {
        // CREATE API
        result = await GenericApi.createRecord(
          PREMIUM_PRICE_ENDPOINT,
          payload
        );
      }

      if (!result?.status) {
        toast.error(
          result?.message ||
          `Failed to ${isEditing ? "update" : "create"} pricing.`
        );
        return;
      }

      toast.success(
        isEditing
          ? "Premium pricing updated successfully."
          : "Premium pricing created successfully."
      );

      setModalOpen(false);
      setEditingId(null);
      setFormData(createEmptyForm());

      await loadData();
    } catch (error) {
      console.error("Error saving premium pricing:", error);
      toast.error(error?.message || "Unable to save premium pricing.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // DELETE
  const handleDelete = (record) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete.");
      return;
    }

    Modal.confirm({
      title: "Delete Premium Pricing?",
      content: (
        <div>
          Are you sure you want to delete{" "}
          <strong>{record.title}</strong> for{" "}
          <strong>{getCityName(record.city)}</strong>?
          <p className="mt-2 text-sm text-rose-500">
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okButtonProps: {
        danger: true,
      },
      centered: true,

      onOk: async () => {
        setDeleteLoading(record._id);

        try {
          // DELETE API
          const result = await GenericApi.deleteRecord(
            PREMIUM_PRICE_ENDPOINT,
            record._id
          );

          if (!result?.status) {
            toast.error(
              result?.message || "Failed to delete premium pricing."
            );
            return;
          }

          toast.success("Premium pricing deleted successfully.");

          const remainingRecords = pricingRecords.filter(
            (item) => item._id !== record._id
          );

          const nextTotalPages = Math.max(
            1,
            Math.ceil(remainingRecords.length / ROWS_PER_PAGE)
          );

          if (page > nextTotalPages) {
            setPage(nextTotalPages);
          }

          await loadData();
        } catch (error) {
          console.error("Error deleting premium pricing:", error);
          toast.error(error?.message || "Unable to delete pricing.");
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  if (authLoading || (auth.user && loading)) {
    return <Loader />;
  }

  if (!auth.user) return null;

  return (
    <div className="page-shell">
      <Breaker />

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <p className="section-label">Pricing Config</p>
          <h1 className="page-title">Premium Pricing</h1>
          <p className="page-subtitle">
            Configure premium driver rates by city.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Add Premium Pricing
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card card-pad">
          <p className="detail-label">Premium Pricing Plans</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {pricingRecords.length}
          </p>
        </div>

        <div className="card card-pad">
          <p className="detail-label">Cities Covered</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {
              new Set(
                pricingRecords
                  .map((record) =>
                    typeof record.city === "object"
                      ? record.city?._id
                      : record.city
                  )
                  .filter(Boolean)
              ).size
            }
          </p>
        </div>
      </div>

      {/* PRICING TABLE */}
      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div>
            <h2 className="card-title">Premium Rate Directory</h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage your premium pricing plans.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {pricingRecords.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">City</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Features</th>
                <th className="px-5 py-3 font-semibold">Hourly</th>
                <th className="px-5 py-3 font-semibold">Weekly</th>
                <th className="px-5 py-3 font-semibold">Monthly</th>
                <th className="px-5 py-3 font-semibold">Outstation</th>
                <th className="px-5 py-3 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleRecords.length ? (
                visibleRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="align-top transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {getCityName(record.city)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {record.title}
                      </p>
                      <p className="mt-1 max-w-xs text-sm text-slate-500">
                        {record.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {(record.features || []).map((feature, index) => (
                          <span
                            key={`${record._id}-feature-${index}`}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {currency(record.prices?.hourly)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {currency(record.prices?.weekly)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {currency(record.prices?.monthly)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {currency(record.prices?.outstation)}
                    </td>

                    {/* ACTIONS */}

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <Dropdown
                          trigger={["click"]}
                          placement="bottomRight"
                          menu={{
                            items: [
                              ...(canUpdate
                                ? [
                                  {
                                    key: "edit",
                                    label: (
                                      <div className="flex items-center gap-2.5 py-0.5">
                                        <PencilSquareIcon className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-slate-700">
                                          Edit Pricing
                                        </span>
                                      </div>
                                    ),
                                  },
                                ]
                                : []),

                              ...(canDelete
                                ? [
                                  {
                                    key: "delete",
                                    danger: true,
                                    label: (
                                      <div className="flex items-center gap-2.5 py-0.5">
                                        <TrashIcon className="h-4 w-4" />
                                        <span className="font-medium">
                                          Delete Pricing
                                        </span>
                                      </div>
                                    ),
                                  },
                                ]
                                : []),
                            ],

                            onClick: ({ key }) => {
                              if (key === "edit") {
                                openEditModal(record);
                              }

                              if (key === "delete") {
                                handleDelete(record);
                              }
                            },
                          }}
                        >
                          <button
                            type="button"
                            disabled={deleteLoading === record._id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg
        border border-slate-200 bg-white text-slate-600
        shadow-sm transition-all duration-200
        hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900
        focus:outline-none focus:ring-2 focus:ring-slate-200
        disabled:cursor-not-allowed disabled:opacity-50"
                            title="More actions"
                            aria-label="More pricing actions"
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </Dropdown>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <p className="font-semibold text-slate-700">
                      No premium pricing found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a city-specific premium driver plan to get
                      started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {pricingRecords.length > ROWS_PER_PAGE && (
        <div className="mt-5 flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
          />
        </div>
      )}

      {/* CREATE / UPDATE MODAL */}
      <Modal
        title={isEditing ? "Edit Premium Pricing" : "Create Premium Pricing"}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        width={720}
        maskClosable={!submitLoading}
        closable={!submitLoading}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* CITY */}
          <div>
            <label className="field-label">
              City <span className="text-rose-500">*</span>
            </label>

            <Select
              options={cityOptions}
              value={
                cityOptions.find(
                  (option) => option.value === formData.city
                ) || null
              }
              onChange={(option) =>
                setFormData((previous) => ({
                  ...previous,
                  city: option?.value || "",
                }))
              }
              isClearable
              placeholder="Search and select a city"
              noOptionsMessage={() => "No cities found"}
              styles={selectStyles}
            />
          </div>

          {/* TITLE */}
          <div>
            <label className="field-label" htmlFor="premium-title">
              Plan Title <span className="text-rose-500">*</span>
            </label>

            <input
              id="premium-title"
              value={formData.title}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              className="field"
              placeholder="e.g. Premium Driver"
              maxLength={100}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="field-label" htmlFor="premium-description">
              Description <span className="text-rose-500">*</span>
            </label>

            <textarea
              id="premium-description"
              value={formData.description}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              className="field min-h-24"
              placeholder="Describe the premium experience"
              maxLength={500}
              required
            />
          </div>

          {/* FEATURES */}
          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Plan Features
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Add the benefits included in this plan.
                </p>
              </div>

              <button
                type="button"
                onClick={addFeature}
                className="btn-secondary !h-9 !px-3"
              >
                <PlusIcon className="h-4 w-4" />
                Add Feature
              </button>
            </div>

            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div
                  key={`feature-${index}`}
                  className="flex items-center gap-2"
                >
                  <input
                    value={feature}
                    onChange={(event) =>
                      updateFeature(index, event.target.value)
                    }
                    className="field"
                    placeholder={`Feature ${index + 1}`}
                    maxLength={120}
                  />

                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="btn-icon !text-rose-500 hover:!bg-rose-50"
                      aria-label={`Remove feature ${index + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* PRICES */}
          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Pricing (₹)
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Enter a non-negative rate for each service.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["hourly", "Hourly Price"],
                ["outstation", "Outstation Price"],
                ["monthly", "Monthly Price"],
                ["weekly", "Weekly Price"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label
                    className="field-label"
                    htmlFor={`premium-${key}`}
                  >
                    {label} <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id={`premium-${key}`}
                    type="number"
                    min="0"
                    step="any"
                    value={formData.prices[key]}
                    onChange={(event) =>
                      updatePrice(key, event.target.value)
                    }
                    className="field"
                    placeholder="0"
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitLoading}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitLoading}
              className="btn-primary"
            >
              {submitLoading
                ? "Saving..."
                : isEditing
                  ? "Update Premium Pricing"
                  : "Create Premium Pricing"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
