import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import Loader from "../../../src/compoents/Loader";
import LoderBtn from "../../../src/compoents/LoderBtn";
import Breaker from "../../../src/compoents/Breaker";
import { GenericApi } from "../../Services/GenericApi";
import { INDIAN_STATES } from "../../utils/constants";

const normalizeSelectValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const createInitialItem = (fields) => fields.reduce((item, field) => {
  item[field.key] = field.defaultValue ?? "";
  return item;
}, {});

const createInitialFormData = (fields) => fields.reduce((data, field) => {
  if (field.type === "array") {
    data[field.key] = Array.from(
      { length: field.initialRows ?? 1 },
      () => createInitialItem(field.itemFields || [])
    );
  } else if (field.type === "object") {
    data[field.key] = createInitialFormData(field.fields || []);
  } else if (field.type === "boolean") {
    data[field.key] = field.defaultValue ?? false;
  } else {
    data[field.key] = field.defaultValue ?? "";
  }
  return data;
}, {});

const normalizeFieldData = (data = {}, fields = []) => fields.reduce((normalized, field) => {
  const value = data[field.key];
  if (field.type === "array") {
    normalized[field.key] = Array.isArray(value)
      ? value.map((item) => normalizeFieldData(item, field.itemFields || []))
      : [];
  } else if (field.type === "object") {
    normalized[field.key] = normalizeFieldData(value || {}, field.fields || []);
  } else if (field.type === "dynamic_select" || field.type === "state_select") {
    normalized[field.key] = normalizeSelectValue(value);
  } else if (value !== undefined) {
    normalized[field.key] = value;
  } else {
    normalized[field.key] = createInitialFormData([field])[field.key];
  }
  return normalized;
}, {});

const getValueAtPath = (value, path) => path.reduce(
  (current, key) => (current == null ? undefined : current[key]),
  value
);

const setValueAtPath = (value, path, nextValue) => {
  const [key, ...remainingPath] = path;
  if (remainingPath.length === 0) {
    return { ...value, [key]: nextValue };
  }
  return {
    ...value,
    [key]: setValueAtPath(value[key] || {}, remainingPath, nextValue),
  };
};

const getFieldValue = (formData, path, field) => getValueAtPath(
  formData,
  [...path, field.key]
);

const getFieldOptions = (field, dynamicOptions) => {
  if (field.type === "dynamic_select" || field.type === "state_select") {
    return dynamicOptions[field.key] || [];
  }
  return field.options || [];
};

const getInputValue = (value, field) => {
  if (field.type === "boolean") return Boolean(value);
  if (value === null || value === undefined) return "";
  return value;
};

const normalizeFieldValue = (value, field) => {
  if (field.type === "number") {
    return value === "" ? "" : Number(value);
  }
  if (field.type === "dynamic_select" || field.type === "state_select") {
    return normalizeSelectValue(value);
  }
  return value;
};

const updateNestedValue = (current, path, value) => {
  if (path.length === 1) {
    const updated = Array.isArray(current) ? [...current] : { ...current };
    updated[path[0]] = value;
    return updated;
  }
  const [key, ...rest] = path;
  const updated = Array.isArray(current) ? [...current] : { ...current };
  updated[key] = updateNestedValue(current[key], rest, value);
  return updated;
};

const normalizeFormData = (data = {}, fields = []) => {
  const normalized = normalizeFieldData(data, fields);
  const stateField = fields.find((field) => field.key === "state" && field.submit === false);
  if (stateField && !normalized.state && data.city && typeof data.city === "object") {
    normalized.state = normalizeSelectValue(data.city.state);
  }

  return normalized;
};

const renderField = (
  field,
  parentPath,
  formData,
  dynamicOptions,
  handleChange,
  readOnly,
  isEditMode,
  providedOptions
) => {
  const value = getFieldValue(formData, parentPath, field);
  const options = providedOptions || getFieldOptions(field, dynamicOptions);
  const inputValue = getInputValue(value, field);
  const fieldName = field.key;

  return (
    <div key={`${parentPath.join(".")}.${field.key}`}>
      <label className="field-label">
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </label>
      {field.description && (
        <p className="mb-1.5 text-xs leading-5 text-slate-500">{field.description}</p>
      )}
      {field.type === "textarea" ? (
        <textarea
          name={fieldName}
          value={inputValue}
          onChange={(event) => handleChange(event, field, parentPath)}
          required={field.required}
          disabled={readOnly}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all"
          rows="4"
        />
      ) : field.type === "dynamic_select" || field.type === "state_select" ? (
        <Select
          options={options}
          value={options.find((option) => String(option.value) === String(inputValue)) || null}
          onChange={(option) => handleChange({ target: { name: fieldName, value: option?.value || "", type: "select" } }, field, parentPath)}
          isDisabled={readOnly}
          isClearable={!field.required && !readOnly}
          placeholder={`Search or select ${field.label.toLowerCase()}...`}
          noOptionsMessage={() => "No matching options"}
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: 44,
              borderRadius: 10,
              borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
              boxShadow: state.isFocused ? "0 0 0 2px rgba(148,163,184,0.2)" : "none",
              "&:hover": { borderColor: "#94a3b8" },
            }),
            menu: (base) => ({ ...base, zIndex: 30 }),
          }}
        />
      ) : field.type === "select" ? (
        <select
          name={fieldName}
          value={inputValue}
          onChange={(event) => handleChange(event, field, parentPath)}
          required={field.required}
          disabled={readOnly}
          className="h-11 w-full rounded-lg border border-gray-300 px-3.5"
        >
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <label className="flex h-10 cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            name={fieldName}
            checked={inputValue}
            onChange={(event) => handleChange(event, field, parentPath)}
            disabled={readOnly}
            className="h-4 w-4 rounded disabled:opacity-50"
          />
          <span className="text-sm font-medium text-slate-700">Yes / Active</span>
        </label>
      ) : field.type === "file" ? (
        <input
          type="file"
          name={fieldName}
          onChange={(event) => handleChange(event, field, parentPath)}
          required={field.required && !isEditMode}
          disabled={readOnly}
          className="w-full text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer disabled:opacity-50"
        />
      ) : (
        <input
          type={field.type || "text"}
          name={fieldName}
          value={inputValue}
          onChange={(event) => handleChange(event, field, parentPath)}
          required={field.required}
          disabled={readOnly}
          step={field.step ?? (field.type === "number" ? "any" : undefined)}
          min={field.min}
          max={field.max}
          className="h-11 w-full rounded-lg border border-gray-300 px-3.5 transition-all"
        />
      )}
    </div>
  );
};

export default function DynamicForm({ config, readOnly = false }) {
  const { title, endpoint, fields, basePath } = config;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(() => createInitialFormData(fields));
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
        setFormData(normalizeFormData(result.data || {}, fields));
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

  const handleChange = (e, field, parentPath = []) => {
    const { name, value, type, files, checked } = e.target;
    const fieldPath = [...parentPath, name];
    let nextValue;
    if (type === "file") {
      nextValue = files[0];
    } else if (type === "checkbox") {
      nextValue = checked;
    } else {
      nextValue = normalizeFieldValue(value, field);
    }
    setFormData((previous) => {
      let updated = updateNestedValue(previous, fieldPath, nextValue);
      if (parentPath.length === 0) {
        fields.forEach((dependentField) => {
          if (dependentField.dependsOn === name) {
            updated = { ...updated, [dependentField.key]: "" };
          }
        });
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingRequiredField = fields.find(
      (field) =>
        field.required &&
        (formData[field.key] === "" ||
          formData[field.key] === null ||
          formData[field.key] === undefined)
    );
    if (missingRequiredField) {
      toast.error(`${missingRequiredField.label} is required.`);
      return;
    }

    const incompleteArray = fields.find(
      (field) =>
        field.type === "array" &&
        (formData[field.key] || []).length < (field.minItems || 0)
    );
    if (incompleteArray) {
      toast.error(`${incompleteArray.label} must have at least ${incompleteArray.minItems} item.`);
      return;
    }

    setSubmitLoading(true);

    const submittedData = Object.fromEntries(
      fields
        .filter((field) => field.submit !== false)
        .map((field) => [field.key, formData[field.key]])
    );
    const hasFile = fields.some((field) => field.type === "file" && field.submit !== false);
    let dataToSend = submittedData;
    
    if (hasFile) {
      dataToSend = new FormData();
      Object.keys(submittedData).forEach(key => {
        dataToSend.append(key, submittedData[key]);
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
    <div className="page-shell">
      <Breaker />
      <div className="card mx-auto max-w-4xl p-5 sm:p-7">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {readOnly ? `View ${title}` : isEditMode ? `Edit ${title}` : `Create ${title}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {fields.map((field, index) => {
              const value = getFieldValue(formData, [], field);
              const options = getFieldOptions(field, dynamicOptions);
              const parentPath = [];

              if (field.type === "array") {
                const rows = Array.isArray(value) ? value : [];
                const addRow = () => setFormData((previous) => {
                  const currentRows = previous[field.key] || [];
                  return setValueAtPath(previous, [field.key], [
                    ...currentRows,
                    createInitialItem(field.itemFields || []),
                  ]);
                });
                const removeRow = (rowIndex) => setFormData((previous) => {
                  const currentRows = previous[field.key] || [];
                  return setValueAtPath(previous, [field.key], currentRows.filter((_, i) => i !== rowIndex));
                });

                return (
                  <section key={field.key} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="card-title">{field.label}</h3>
                      {!readOnly && (
                        <button type="button" onClick={addRow} className="btn-secondary">
                          + Add {field.label.replace(/s$/, "")}
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {rows.map((_, rowIndex) => (
                        <div key={`${field.key}-${rowIndex}`} className="rounded-lg bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Item {rowIndex + 1}</span>
                            {!readOnly && (
                              <button type="button" onClick={() => removeRow(rowIndex)} className="text-sm font-medium text-rose-600">
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {field.itemFields.map((itemField) => renderField(
                              itemField,
                              [field.key, rowIndex],
                              formData,
                              dynamicOptions,
                              handleChange,
                              readOnly,
                              isEditMode
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (field.type === "object") {
                return (
                  <section key={field.key} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                    <h3 className="card-title mb-4">{field.label}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {field.fields.map((nestedField) => renderField(
                        nestedField,
                        [field.key],
                        formData,
                        dynamicOptions,
                        handleChange,
                        readOnly,
                        isEditMode
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <div key={index} className={field.fullWidth ? "md:col-span-2" : ""}>
                  {renderField(field, parentPath, formData, dynamicOptions, handleChange, readOnly, isEditMode, options)}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="btn-secondary"
            >
              {readOnly ? "Back" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary min-w-[96px]"
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
