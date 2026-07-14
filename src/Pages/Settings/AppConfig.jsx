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
  const [appVersion, setAppVersion] = useState("");

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
        setAppVersion(data.appVersion || "");
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

    if (appVersion && !/^\d+\.\d+\.\d+$/.test(appVersion.trim())) {
      toast.error("App Version must be in format like 1.0.0");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        supportPhone: supportPhone.trim(),
        supportEmail: supportEmail.trim(),
        sosNumber: sosNumber.trim(),
        maintenanceMode,
        appVersion: appVersion.trim(),
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">App Configuration</h2>
        <p className="text-sm opacity-80 mt-1">Manage global app settings for Driver and User Apps</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone Number</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="+91 9999999999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SOS / Emergency Number</label>
            <input
              type="text"
              value={sosNumber}
              onChange={(e) => setSosNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="support@dvagoo.in"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current App Version (Optional)</label>
            <input
              type="text"
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="1.0.0"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="maintenanceMode" className="ml-2 text-sm font-medium text-gray-900">
              Enable Maintenance Mode
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {saving ? <LoderBtn /> : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
