import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../../src/compoents/Loader";
import LoderBtn from "../../../src/compoents/LoderBtn";
import Breaker from "../../../src/compoents/Breaker";
import { GenericApi } from "../../Services/GenericApi";
import { INDIAN_STATES } from "../../utils/constants";

export default function DynamicForm({ config, readOnly = false }) {
  const { title, endpoint, fields, basePath } = config;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // State for dynamic select options
  const [dynamicOptions, setDynamicOptions] = useState({});

  useEffect(() => {
    fetchOptions();
    if (isEditMode) {
      fetchData();
    }
  }, [id, config]);

  const fetchDependentOptions = async (field, parentValue) => {
    if (!parentValue) {
      setDynamicOptions(prev => ({ ...prev, [field.key]: [] }));
      return;
    }
    try {
      const url = `${field.optionsEndpoint}?${field.dependsParam || field.dependsOn}=${parentValue}`;
      const result = await GenericApi.fetchList(url, { rowsPerPage: 1000 });
      if (result?.status) {
        setDynamicOptions(prev => ({
          ...prev,
          [field.key]: result.data.map(item => ({
            label: item[field.labelKey || "name"],
            value: item[field.valueKey || "_id"]
          }))
        }));
      }
    } catch (error) {
      console.error(`Error fetching dependent options for ${field.label}:`, error);
    }
  };

  useEffect(() => {
    fields.forEach(field => {
      if (field.type === "dynamic_select" && field.dependsOn) {
        // Fetch if parent value exists, otherwise clear options
        if (formData[field.dependsOn]) {
          fetchDependentOptions(field, formData[field.dependsOn]);
        } else {
          setDynamicOptions(prev => ({ ...prev, [field.key]: [] }));
        }
      }
    });
  }, [fields, formData]);

  const fetchOptions = async () => {
    const optionsObj = {};
    for (const field of fields) {
      if (field.type === "dynamic_select" && field.optionsEndpoint && !field.dependsOn) {
        try {
          const result = await GenericApi.fetchList(field.optionsEndpoint, { rowsPerPage: 1000 });
          if (result?.status) {
            optionsObj[field.key] = result.data.map(item => ({
              label: item[field.labelKey || "name"],
              value: item[field.valueKey || "_id"]
            }));
          }
        } catch (error) {
          console.error(`Error fetching options for ${field.label}:`, error);
        }
      }
      
      if (field.type === "state_select") {
        try {
          // Fetch existing states to filter them out of the INDIAN_STATES list
          const result = await GenericApi.fetchList("/api/admin/states", { rowsPerPage: 1000 });
          let availableStates = INDIAN_STATES;
          if (result?.status) {
            const existingStates = result.data.map(s => s.name);
            availableStates = INDIAN_STATES.filter(s => !existingStates.includes(s));
          }
          optionsObj[field.key] = availableStates.map(s => ({ label: s, value: s }));
        } catch (error) {
          console.error("Error fetching states:", error);
          optionsObj[field.key] = INDIAN_STATES.map(s => ({ label: s, value: s }));
        }
      }
    }
    setDynamicOptions(optionsObj);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await GenericApi.fetchDetails(endpoint, id);
      if (result?.status) {
        setFormData(result.data || {});
      } else {
        toast.error(result?.message || `Failed to fetch ${title} details.`);
        navigate(basePath);
      }
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, field) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      let newFormData = { ...formData, [name]: value };
      
      // Clear dependent fields if parent changes
      fields.forEach(f => {
        if (f.dependsOn === name) {
          newFormData[f.key] = "";
        }
      });
      
      setFormData(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const hasFile = fields.some(f => f.type === 'file');
    let dataToSend = formData;
    
    if (hasFile) {
      dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });
    }

    try {
      let result;
      if (isEditMode) {
        result = await GenericApi.updateRecord(endpoint, id, dataToSend, hasFile);
      } else {
        result = await GenericApi.createRecord(endpoint, dataToSend, hasFile);
      }

      if (result?.status) {
        toast.success(`${title} ${isEditMode ? "updated" : "created"} successfully!`);
        navigate(basePath);
      } else {
        toast.error(result?.message || `Failed to ${isEditMode ? "update" : "create"} ${title}.`);
      }
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6"><Breaker /></div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          {readOnly ? `View ${title}` : isEditMode ? `Edit ${title}` : `Create ${title}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => {
              const options = field.type === "dynamic_select" || field.type === "state_select" 
                ? (dynamicOptions[field.key] || []) 
                : field.options || [];

              return (
                <div key={index} className={field.fullWidth ? "col-span-1 md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(e, field)}
                      required={field.required}
                      disabled={readOnly}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      rows="4"
                    />
                  ) : (field.type === "select" || field.type === "dynamic_select" || field.type === "state_select") ? (
                    <select
                      name={field.key}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(e, field)}
                      required={field.required}
                      disabled={readOnly}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select {field.label}</option>
                      {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <label className="flex items-center space-x-3 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        name={field.key}
                        checked={formData[field.key] || false}
                        onChange={(e) => handleChange(e, field)}
                        disabled={readOnly}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-gray-700 font-medium">Yes / Active</span>
                    </label>
                  ) : field.type === "file" ? (
                    <input
                      type="file"
                      name={field.key}
                      onChange={(e) => handleChange(e, field)}
                      required={field.required && !isEditMode}
                      disabled={readOnly}
                      className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.key}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(e, field)}
                      required={field.required}
                      disabled={readOnly}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {readOnly ? "Back" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px]"
              >
                {submitLoading ? <LoderBtn /> : (isEditMode ? "Update" : "Save")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
