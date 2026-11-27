import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Form, Input, Modal, Switch, Tooltip } from "antd";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import toast from "react-hot-toast";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { useAuth } from "../../auth/AuthContext";
import { GenericApi } from "../../Services/GenericApi";
import { getImageUrl } from "../../utils/imageUtils";

const BRAND_ENDPOINT = "/api/admin/vehicleBrand";
const MODEL_ENDPOINT = "/api/admin/vehicleModel";
const PREVIEW_LIMIT = 3;

const getReferenceId = (reference) => {
  if (reference && typeof reference === "object") {
    return reference._id || reference.id || "";
  }
  return reference || "";
};

const StatusBadge = ({ active }) => (
  <span className={active ? "badge-success" : "badge-danger"}>
    {active ? "Active" : "Inactive"}
  </span>
);

const BrandAvatar = ({ brand, size = "h-11 w-11" }) =>
  brand.image ? (
    <img
      src={getImageUrl(brand.image)}
      alt={`${brand.name} logo`}
      className={`${size} shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1`}
    />
  ) : (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500`}
    >
      {brand.name?.slice(0, 2).toUpperCase() || "BR"}
    </div>
  );

export default function VehicleCatalogPage() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [brandImage, setBrandImage] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [viewingBrand, setViewingBrand] = useState(null);
  const [managingBrandId, setManagingBrandId] = useState(null);
  const [brandActionAnchor, setBrandActionAnchor] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [brandForm] = Form.useForm();
  const [modelForm] = Form.useForm();

  const canReadBrand = hasPermission("VehicleBrand", "read");
  const canCreateBrand = hasPermission("VehicleBrand", "create");
  const canUpdateBrand = hasPermission("VehicleBrand", "update");
  const canDeleteBrand = hasPermission("VehicleBrand", "delete");
  const canReadModels = hasPermission("VehicleModel", "read");
  const canCreateModel = hasPermission("VehicleModel", "create");
  const canUpdateModel = hasPermission("VehicleModel", "update");
  const canDeleteModel = hasPermission("VehicleModel", "delete");
  const hasBrandActions = canReadBrand || canUpdateBrand || canDeleteBrand;

  const modelsByBrand = useMemo(() => {
    const map = {};
    models.forEach((model) => {
      const id = getReferenceId(model.vehicleBrand);
      if (!map[id]) map[id] = [];
      map[id].push(model);
    });
    return map;
  }, [models]);

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter((brand) => {
      if (brand.name?.toLowerCase().includes(term)) return true;
      return (modelsByBrand[brand._id] || []).some((model) =>
        model.name?.toLowerCase().includes(term)
      );
    });
  }, [brands, modelsByBrand, search]);

  const activeBrandCount = brands.filter((brand) => brand.isActive).length;
  const activeModelCount = models.filter((model) => model.isActive).length;

  const managingBrand = managingBrandId
    ? brands.find((brand) => brand._id === managingBrandId) || null
    : null;
  const managingModels = managingBrand ? modelsByBrand[managingBrand._id] || [] : [];
  const viewingModels = viewingBrand ? modelsByBrand[viewingBrand._id] || [] : [];

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [brandResult, modelResult] = await Promise.all([
        GenericApi.fetchList(BRAND_ENDPOINT, { page: 1, rowsPerPage: 1000 }),
        GenericApi.fetchList(MODEL_ENDPOINT, { page: 1, rowsPerPage: 1000 }),
      ]);

      if (!brandResult?.status) {
        throw new Error(brandResult?.message || "Failed to load vehicle brands.");
      }
      if (!modelResult?.status) {
        throw new Error(modelResult?.message || "Failed to load vehicle models.");
      }

      setBrands(brandResult.data || []);
      setModels(modelResult.data || []);
    } catch (error) {
      console.error("Error loading vehicle catalog:", error);
      if (error?.message) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && auth.user) loadCatalog();
  }, [authLoading, auth.user, loadCatalog]);

  /* ---------- Brand handlers ---------- */
  const openBrandModal = () => {
    setEditingBrand(null);
    brandForm.resetFields();
    brandForm.setFieldsValue({ isActive: true });
    setBrandImage(null);
    setBrandModalOpen(true);
  };

  const openEditBrandModal = (brand) => {
    setEditingBrand(brand);
    brandForm.resetFields();
    brandForm.setFieldsValue({
      name: brand.name || "",
      isActive: brand.isActive ?? true,
    });
    setBrandImage(null);
    setBrandModalOpen(true);
  };

  const closeBrandModal = () => {
    setBrandModalOpen(false);
    setEditingBrand(null);
    setBrandImage(null);
    brandForm.resetFields();
  };

  const openBrandActions = (event, brand) => {
    setBrandActionAnchor(event.currentTarget);
    setSelectedBrand(brand);
  };

  const closeBrandActions = () => {
    setBrandActionAnchor(null);
    setSelectedBrand(null);
  };

  const handleSaveBrand = async (values) => {
    if (!editingBrand && !brandImage) {
      toast.error("Choose an image for this brand.");
      return;
    }

    setSavingBrand(true);
    try {
      const payload = new FormData();
      payload.append("name", values.name.trim());
      if (brandImage) payload.append("image", brandImage);
      payload.append("isActive", String(values.isActive ?? true));

      const result = editingBrand
        ? await GenericApi.updateRecord(BRAND_ENDPOINT, editingBrand._id, payload, true)
        : await GenericApi.createRecord(BRAND_ENDPOINT, payload, true);
      if (!result?.status) {
        toast.error(
          result?.message || `Failed to ${editingBrand ? "update" : "create"} vehicle brand.`
        );
        return;
      }

      toast.success(`Vehicle brand ${editingBrand ? "updated" : "created"}.`);
      closeBrandModal();
      await loadCatalog();
    } catch (error) {
      console.error("Error saving vehicle brand:", error);
    } finally {
      setSavingBrand(false);
    }
  };

  const confirmDeleteBrand = (brand) => {
    closeBrandActions();
    const modelCount = (modelsByBrand[brand._id] || []).length;
    Modal.confirm({
      title: "Delete vehicle brand?",
      content: modelCount
        ? `${brand.name} has ${modelCount} model${modelCount === 1 ? "" : "s"}. Deleting the brand may also affect its models.`
        : `${brand.name} will be permanently removed.`,
      okText: "Delete brand",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await GenericApi.deleteRecord(BRAND_ENDPOINT, brand._id);
          if (!result?.status) {
            toast.error(result?.message || "Failed to delete vehicle brand.");
            return;
          }
          toast.success("Vehicle brand deleted.");
          await loadCatalog();
        } catch (error) {
          console.error("Error deleting vehicle brand:", error);
        }
      },
    });
  };

  /* ---------- Model handlers ---------- */
  const openCreateModelModal = (brand) => {
    setActiveBrand(brand);
    setEditingModel(null);
    modelForm.resetFields();
    modelForm.setFieldsValue({ isActive: true });
    setModelModalOpen(true);
  };

  const openEditModelModal = (brand, model) => {
    setActiveBrand(brand);
    setEditingModel(model);
    modelForm.resetFields();
    modelForm.setFieldsValue({
      name: model.name || "",
      isActive: model.isActive ?? true,
    });
    setModelModalOpen(true);
  };

  const closeModelModal = () => {
    setModelModalOpen(false);
    setActiveBrand(null);
    setEditingModel(null);
    modelForm.resetFields();
  };

  const handleSaveModel = async (values) => {
    if (!activeBrand?._id) {
      toast.error("Select a brand before saving its model.");
      return;
    }

    setSavingModel(true);
    try {
      const payload = {
        name: values.name.trim(),
        vehicleBrand: activeBrand._id,
        isActive: values.isActive ?? true,
      };
      const result = editingModel
        ? await GenericApi.updateRecord(MODEL_ENDPOINT, editingModel._id, payload)
        : await GenericApi.createRecord(MODEL_ENDPOINT, payload);

      if (!result?.status) {
        toast.error(
          result?.message || `Failed to ${editingModel ? "update" : "create"} vehicle model.`
        );
        return;
      }

      toast.success(`Vehicle model ${editingModel ? "updated" : "created"}.`);
      closeModelModal();
      await loadCatalog();
    } catch (error) {
      console.error("Error saving vehicle model:", error);
    } finally {
      setSavingModel(false);
    }
  };

  const confirmDeleteModel = (model) => {
    Modal.confirm({
      title: "Delete vehicle model?",
      content: `“${model.name}” will be permanently removed from this brand.`,
      okText: "Delete model",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await GenericApi.deleteRecord(MODEL_ENDPOINT, model._id);
          if (!result?.status) {
            toast.error(result?.message || "Failed to delete vehicle model.");
            return;
          }
          toast.success("Vehicle model deleted.");
          await loadCatalog();
        } catch (error) {
          console.error("Error deleting vehicle model:", error);
        }
      },
    });
  };

  if (authLoading || (auth.user && loading)) return <Loader />;
  if (!auth.user) return null;

  return (
    <div className="page-shell">
      <Breaker />

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="section-label">Fleet Management</p>
          <h1 className="page-title">Vehicle Brands &amp; Models</h1>
          <p className="page-subtitle">
            Maintain your vehicle catalog — brands, logos and their models in one place.
          </p>
        </div>
        {canCreateBrand && (
          <button type="button" onClick={openBrandModal} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add Brand
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card card-pad">
          <p className="detail-label">Total Brands</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{brands.length}</p>
          <p className="mt-1 text-xs text-slate-500">{activeBrandCount} active</p>
        </div>
        <div className="card card-pad">
          <p className="detail-label">Total Models</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {canReadModels ? models.length : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {canReadModels ? `${activeModelCount} active` : "Access restricted"}
          </p>
        </div>
        <div className="card card-pad">
          <p className="detail-label">Avg. Models / Brand</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {canReadModels && brands.length ? (models.length / brands.length).toFixed(1) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all brands</p>
        </div>
      </div>

      {/* Table card */}
      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="card-title">Brand Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredBrands.length} of {brands.length} brand{brands.length === 1 ? "" : "s"}
            </p>
          </div>
          <Input
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brand or model"
            prefix={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
            className="sm:!w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Models</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Manage Models</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <p className="font-semibold text-slate-700">
                      {brands.length === 0 ? "No vehicle brands yet" : "No matching results"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {brands.length === 0
                        ? "Add a brand to start managing its models."
                        : "Try a different brand or model name."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const brandModels = modelsByBrand[brand._id] || [];
                  const preview = brandModels.slice(0, PREVIEW_LIMIT);
                  const extra = brandModels.length - preview.length;

                  return (
                    <tr key={brand._id} className="align-middle transition-colors hover:bg-slate-50/70">
                      {/* Brand */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <BrandAvatar brand={brand} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{brand.name}</p>
                            <p className="text-xs text-slate-500">
                              {canReadModels
                                ? `${brandModels.length} model${brandModels.length === 1 ? "" : "s"}`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Models preview (read-only chips) */}
                      <td className="px-5 py-4">
                        {!canReadModels ? (
                          <span className="text-sm text-slate-400">Model access restricted</span>
                        ) : brandModels.length ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {preview.map((model) => (
                              <span
                                key={model._id}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${model.isActive
                                    ? "border-slate-200 bg-slate-50 text-slate-700"
                                    : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                                  }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${model.isActive ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                />
                                {model.name}
                              </span>
                            ))}
                            {extra > 0 && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                +{extra} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No models added</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge active={brand.isActive} />
                      </td>

                      {/* Manage Models column */}
                      <td className="px-5 py-4">
                        {canReadModels || canCreateModel ? (
                          <div className="flex items-center gap-2">
                            {canReadModels && (
                              <Tooltip title="View, edit or delete models">
                                <button
                                  type="button"
                                  onClick={() => setManagingBrandId(brand._id)}
                                  className="btn-secondary !h-9 !px-3"
                                >
                                  <Squares2X2Icon className="h-4 w-4" />
                                  Manage
                                </button>
                              </Tooltip>
                            )}
                            {canCreateModel && (
                              <Tooltip title={`Add a model to ${brand.name}`}>
                                <button
                                  type="button"
                                  onClick={() => openCreateModelModal(brand)}
                                  className="btn-primary !h-9 !px-3"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                  Add
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      {/* Brand actions */}
                      <td className="px-5 py-4 text-right">
                        {hasBrandActions ? (
                          <IconButton
                            aria-label={`Actions for ${brand.name}`}
                            onClick={(event) => openBrandActions(event, brand)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single shared brand action menu */}
      <Menu
        anchorEl={brandActionAnchor}
        open={Boolean(brandActionAnchor)}
        onClose={closeBrandActions}
        PaperProps={{ elevation: 8, sx: { minWidth: 176, borderRadius: 2, mt: 0.5 } }}
      >
        {canReadBrand && (
          <MenuItem
            onClick={() => {
              setViewingBrand(selectedBrand);
              closeBrandActions();
            }}
          >
            <EyeIcon className="mr-2 h-4 w-4 text-sky-600" />
            View details
          </MenuItem>
        )}
        {canUpdateBrand && (
          <MenuItem
            onClick={() => {
              const brand = selectedBrand;
              closeBrandActions();
              openEditBrandModal(brand);
            }}
          >
            <PencilIcon className="mr-2 h-4 w-4 text-emerald-600" />
            Edit brand
          </MenuItem>
        )}
        {canDeleteBrand && (
          <MenuItem onClick={() => confirmDeleteBrand(selectedBrand)} sx={{ color: "error.main" }}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete brand
          </MenuItem>
        )}
      </Menu>

      {/* Manage Models modal */}
      <Modal
        title={
          managingBrand ? (
            <div className="flex items-center gap-3">
              <BrandAvatar brand={managingBrand} size="h-10 w-10" />
              <div>
                <p className="text-base font-semibold text-slate-900">{managingBrand.name}</p>
                <p className="text-xs font-normal text-slate-500">
                  {managingModels.length} model{managingModels.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ) : (
            "Manage Models"
          )
        }
        open={Boolean(managingBrand)}
        onCancel={() => setManagingBrandId(null)}
        footer={<Button onClick={() => setManagingBrandId(null)}>Close</Button>}
        width={560}
        destroyOnClose
      >
        {managingBrand && (
          <div className="py-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Models</h3>
              {canCreateModel && (
                <button
                  type="button"
                  onClick={() => openCreateModelModal(managingBrand)}
                  className="btn-primary !h-9 !px-3"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Model
                </button>
              )}
            </div>

            {managingModels.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No models added for this brand yet"
              />
            ) : (
              <ul className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                {managingModels.map((model) => (
                  <li
                    key={model._id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${model.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                      />
                      <span className="truncate text-sm font-medium text-slate-800">
                        {model.name}
                      </span>
                      <StatusBadge active={model.isActive} />
                    </div>
                    <div className="flex items-center gap-1">
                      {canUpdateModel && (
                        <Tooltip title="Edit model">
                          <button
                            type="button"
                            onClick={() => openEditModelModal(managingBrand, model)}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${model.name}`}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                      {canDeleteModel && (
                        <Tooltip title="Delete model">
                          <button
                            type="button"
                            onClick={() => confirmDeleteModel(model)}
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${model.name}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit brand modal */}
      <Modal
        title={editingBrand ? "Edit Vehicle Brand" : "Add Vehicle Brand"}
        open={brandModalOpen}
        onCancel={closeBrandModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={brandForm}
          layout="vertical"
          onFinish={handleSaveBrand}
          initialValues={{ isActive: true }}
          className="pt-3"
        >
          <Form.Item
            name="name"
            label="Brand Name"
            rules={[
              { required: true, message: "Enter the brand name." },
              { whitespace: true, message: "Brand name cannot be blank." },
            ]}
          >
            <Input placeholder="e.g. Mahindra" size="large" maxLength={80} />
          </Form.Item>
          {editingBrand?.image && !brandImage && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <img
                src={getImageUrl(editingBrand.image)}
                alt={`${editingBrand.name} current logo`}
                className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">Current brand image</p>
                <p className="text-xs text-slate-500">Choose a new file to replace it.</p>
              </div>
            </div>
          )}
          <Form.Item label="Brand Image" required={!editingBrand}>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setBrandImage(event.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
            />
            {brandImage && <p className="mt-2 text-xs text-slate-500">{brandImage.name}</p>}
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button onClick={closeBrandModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingBrand}>
              {editingBrand ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View brand details modal */}
      <Modal
        title="Vehicle Brand Details"
        open={Boolean(viewingBrand)}
        onCancel={() => setViewingBrand(null)}
        footer={<Button onClick={() => setViewingBrand(null)}>Close</Button>}
      >
        {viewingBrand && (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <BrandAvatar brand={viewingBrand} size="h-16 w-16" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Brand Name
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{viewingBrand.name}</p>
                <div className="mt-2">
                  <StatusBadge active={viewingBrand.isActive} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Models</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {!canReadModels ? (
                  <span className="text-sm text-slate-500">Model access restricted.</span>
                ) : viewingModels.length ? (
                  viewingModels.map((model) => (
                    <span
                      key={model._id}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {model.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No models added yet.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit model modal */}
      <Modal
        title={editingModel ? "Edit Vehicle Model" : "Add Vehicle Model"}
        open={modelModalOpen}
        onCancel={closeModelModal}
        footer={null}
        destroyOnClose
        zIndex={1100}
      >
        <Form
          form={modelForm}
          layout="vertical"
          onFinish={handleSaveModel}
          initialValues={{ isActive: true }}
          className="pt-3"
        >
          {activeBrand && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-3">
              <BrandAvatar brand={activeBrand} size="h-10 w-10" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Brand</p>
                <p className="font-semibold text-slate-800">{activeBrand.name}</p>
              </div>
            </div>
          )}
          <Form.Item
            name="name"
            label="Model Name"
            rules={[
              { required: true, message: "Enter the model name." },
              { whitespace: true, message: "Model name cannot be blank." },
            ]}
          >
            <Input placeholder="e.g. Scorpio-N" size="large" maxLength={80} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button onClick={closeModelModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingModel}>
              {editingModel ? "Save Changes" : "Add Model"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}