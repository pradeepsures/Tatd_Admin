import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAppConfig, updateAppConfig } from "../../Services/SettingsApi";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";

export default function AppConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [sosNumber, setSosNumber] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userAppVersion, setUserAppVersion] = useState("");
  const [driverAppVersion, setDriverAppVersion] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await getAppConfig();
      if (res?.success || res?.status) {
        const data = res.data;
        setConfig(data);
        setSupportPhone(data.supportPhone || "");
        setSupportEmail(data.supportEmail || "");
        setSosNumber(data.sosNumber || "");
        setMaintenanceMode(data.maintenanceMode || false);
        setUserAppVersion(data.userAppVersion || "");
        setDriverAppVersion(data.driverAppVersion || "");
      }
    } catch (err) {
      toast.error("Failed to load App Config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validations
    if (supportPhone && !/^\+?[0-9]{10,15}$/.test(supportPhone.trim().replace(/\s+/g, ""))) {
      toast.error("Please enter a valid Support Phone Number (10-15 digits)");
      return;
    }

    if (sosNumber && !/^[0-9]{3,15}$/.test(sosNumber.trim())) {
      toast.error("Please enter a valid SOS Number (3-15 digits)");
      return;
    }

    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim())) {
      toast.error("Please enter a valid Support Email");
      return;
    }

    if (userAppVersion && !/^\d+\.\d+\.\d+$/.test(userAppVersion.trim())) {
      toast.error("User App Version must be in format like 1.0.0");
      return;
    }

    if (driverAppVersion && !/^\d+\.\d+\.\d+$/.test(driverAppVersion.trim())) {
      toast.error("Driver App Version must be in format like 1.0.0");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        supportPhone: supportPhone.trim(),
        supportEmail: supportEmail.trim(),
        sosNumber: sosNumber.trim(),
        maintenanceMode,
        userAppVersion: userAppVersion.trim(),
        driverAppVersion: driverAppVersion.trim(),
      };
      const res = await updateAppConfig(payload);
      if (res?.success || res?.status) {
        toast.success("App Config updated successfully");
        setConfig(res.data);
      } else {
        toast.error(res?.message || "Failed to update config");
      }
    } catch (error) {
      toast.error("Failed to update App Config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">App Configuration</h2>
          <p className="page-subtitle">Manage global app settings for Driver and User Apps</p>
        </div>
      </div>

      <div className="card p-5 sm:p-8 max-w-4xl">
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>
            <label className="field-label">Support Phone Number</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="field"
              placeholder="+91 9999999999"
            />
          </div>

          <div>
            <label className="field-label">SOS / Emergency Number</label>
            <input
              type="text"
              value={sosNumber}
              onChange={(e) => setSosNumber(e.target.value)}
              className="field"
              placeholder="100"
            />
          </div>

          <div>
            <label className="field-label">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="field"
              placeholder="support@dvagoo.in"
            />
          </div>

          <div>
            <label className="field-label">User App Version (Optional)</label>
            <input
              type="text"
              value={userAppVersion}
              onChange={(e) => setUserAppVersion(e.target.value)}
              className="field"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="field-label">Driver App Version (Optional)</label>
            <input
              type="text"
              value={driverAppVersion}
              onChange={(e) => setDriverAppVersion(e.target.value)}
              className="field"
              placeholder="1.0.0"
            />
          </div>

          <div className="flex items-center rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="maintenanceMode" className="ml-3 cursor-pointer text-sm font-semibold text-slate-700">
              Enable Maintenance Mode
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving ? <LoderBtn /> : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
