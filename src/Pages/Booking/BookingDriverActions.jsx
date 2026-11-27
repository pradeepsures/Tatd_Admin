import { useCallback, useEffect, useState } from "react";
import { Modal, Select } from "antd";
import toast from "react-hot-toast";
import {
  assignDriverToBooking,
  getAvailableDriversForBooking,
  getNearbyDriversForBooking,
  unassignDriverFromBooking,
} from "../../Services/BookingApi";

const { Option } = Select;

export default function BookingDriverActions({
  bookingId,
  driver,
  assignmentStatus,
  bookingStatus,
  onRefresh,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("available");
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  const normalizedStatus = String(bookingStatus || "").toLowerCase();
  const canManageAssignment = !["completed", "cancelled", "canceled"].includes(normalizedStatus);

  const fetchDrivers = useCallback(async () => {
    setDriversLoading(true);
    try {
      const getDrivers =
        searchMode === "nearby"
          ? getNearbyDriversForBooking
          : getAvailableDriversForBooking;
      const result = await getDrivers(bookingId, search);

      if (!result?.status) {
        throw new Error(result?.message || "Failed to load drivers");
      }

      setDrivers(result.data || []);
    } catch (error) {
      setDrivers([]);
      toast.error(error.message || "Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  }, [bookingId, search, searchMode]);

  useEffect(() => {
    if (isModalOpen) fetchDrivers();
  }, [isModalOpen, fetchDrivers]);

  const openAssignModal = () => {
    setSelectedDriver("");
    setSearch("");
    setSearchMode("available");
    setIsModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedDriver) {
      toast.error("Select chauffeur");
      return;
    }

    try {
      setSaving(true);
      const result = await assignDriverToBooking(bookingId, selectedDriver);
      toast.success(result.message || "Chauffeur assigned successfully");
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to assign chauffeur");
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setUnassigning(true);
      const result = await unassignDriverFromBooking(
        bookingId,
        driver?._id
      );
      toast.success(result.message || "Chauffeur unassigned successfully");
      onRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to unassign chauffeur");
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <>
      {driver ? (
        <>
          <div className="font-semibold text-slate-800">{driver.name || "-"}</div>
          <div className="text-xs text-slate-500">{driver.phone || "-"}</div>
          {canManageAssignment && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={handleUnassign}
                disabled={unassigning}
                className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {unassigning ? "Unassigning..." : "Unassign"}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <span className="text-xs italic text-slate-400">No Chauffeur</span>
          {canManageAssignment && (
            <button
              onClick={openAssignModal}
              className="mt-2 btn-primary !h-8 !px-3 !text-xs"
            >
              Assign Driver
            </button>
          )}
        </>
      )}

      {driver && assignmentStatus === "unassigned" && canManageAssignment && (
        <button
          onClick={openAssignModal}
          className="mt-2 btn-primary !h-8 !px-3 !text-xs"
        >
          Assign Driver
        </button>
      )}

      <Modal
        title="Assign Chauffeur"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAssign}
        confirmLoading={saving}
      >
        <div className="my-4">
          <label className="field-label">DRIVER SEARCH TYPE</label>
          <Select
            value={searchMode}
            onChange={(value) => {
              setSearchMode(value);
              setSelectedDriver("");
            }}
            style={{ width: "100%" }}
            options={[
              { value: "available", label: "Available Drivers" },
              { value: "nearby", label: "Nearby Drivers" },
            ]}
          />
        </div>
        <div>
          <label className="field-label">SELECT CHAUFFEUR</label>
          <Select
            showSearch
            placeholder={`Search ${searchMode} drivers by Name/Phone`}
            value={selectedDriver || undefined}
            onChange={setSelectedDriver}
            onSearch={setSearch}
            style={{ width: "100%" }}
            loading={driversLoading}
            filterOption={false}
          >
            {drivers.map((availableDriver) => (
              <Option key={availableDriver._id} value={availableDriver._id}>
                {availableDriver.name} ({availableDriver.phone}) -{" "}
                {availableDriver.isOnline ? "Online" : "Offline"}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </>
  );
}
