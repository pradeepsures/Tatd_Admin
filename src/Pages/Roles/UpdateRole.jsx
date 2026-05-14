import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateRole, getRoleById } from "../../Services/RoleApi";
import Breaker from "../../compoents/Breaker";
import toast from "react-hot-toast";
import Loader from "../../compoents/Loader";
import { getAllSectionName } from "../../Services/MemberMasterApi";
import { Select } from "antd";
const { Option } = Select;

const UpdateRole = () => {
  const [formData, setFormData] = useState({
    name: "",
    permission: [],
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({});
  const [sectionOptions, setSectionOptions] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (id) {
  //     const fetchRole = async () => {
  //       setLoading(true);
  //       try {
  //         const res = await getRoleById(id);
  //         if (res.status) {
  //           const { name, permission } = res.data.role;
  //           setFormData({
  //             name,
  //             permission: permission.map((perm) => ({
  //               ...perm,
  //             })),
  //           });
  //           toast.success("Role fetched successfully!");
  //         } else {
  //           toast.error("Failed to fetch role data.");
  //         }
  //       } catch (err) {
  //         toast.error("Server error while fetching role");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchRole();
  //   }
  // }, [id]);

  useEffect(() => {
    if (id) {
      fetchSections(); // 👈 ADD THIS

      const fetchRole = async () => {
        setLoading(true);
        try {
          const res = await getRoleById(id);
          if (res.status) {
            const { name, permission } = res.data.role;

            setFormData({
              name,
              permission: permission.map((perm) => ({
                ...perm,
              })),
            });

            toast.success("Role fetched successfully!");
          } else {
            toast.error("Failed to fetch role data.");
          }
        } catch (err) {
          toast.error("Server error while fetching role");
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    }
  }, [id]);

  const fetchSections = async (search = "") => {
    try {
      setSectionLoading(true);

      const res = await getAllSectionName({
        page: 1,
        rowsPerPage: 20,
        searchQuery: search,
      });

      if (res?.status) {
        setSectionOptions(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching sections", err);
    } finally {
      setSectionLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (index, field, value) => {
    const updatedPermissions = [...formData.permission];
    updatedPermissions[index][field] = value;
    setFormData({ ...formData, permission: updatedPermissions });
  };

  const handleCheckboxChange = (index, field) => {
    const updatedPermissions = [...formData.permission];
    updatedPermissions[index][field] = !updatedPermissions[index][field];
    setFormData({ ...formData, permission: updatedPermissions });
  };

  const handleAddPermission = () => {
    setFormData({
      ...formData,
      permission: [
        ...formData.permission,
        {
          sectionName: "",
          isSection: true,
          isCreate: false,
          isRead: false,
          isUpdate: false,
          isDelete: false,
        },
      ],
    });
  };

  const handleDeletePermission = (index) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this role?"
    );
    if (isConfirmed) {
      const updatedPermissions = formData.permission.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, permission: updatedPermissions });
      console.log("Permission deleted");
    } else {
      console.log("User cancelled deletion");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Role name is required.";
    }

    formData.permission.forEach((perm, i) => {
      if (!perm.sectionName.trim()) {
        errors[`sectionName_${i}`] = `Section name is required for permission ${i + 1
          }`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setApiError(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        permissions: formData.permission.map((perm) => ({
          sectionName: perm.sectionName,
          isSection: true,
          isCreate: perm.isCreate || false,
          isRead: perm.isRead || false,
          isUpdate: perm.isUpdate || false,
          isDelete: perm.isDelete || false,
        })),
      };

      const res = await updateRole({ id, data: payload });
      if (res.status) {
        toast.success("Role updated successfully!");
        navigate("/home/role");
      } else {
        toast.error(res.message || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the role.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="m-3">
      <div className="mb-4">
        <Breaker />
      </div>
      <div className="ml-5 mt-10 bg-white p-6 max-w-9xl rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <label className="ml-2 opacity-85 font-normal">Role Name:</label>
          <input
            className="w-full h-10 mt-1 mb-1 border rounded-xl pl-4 border-gray-500"
            type="text"
            name="name"
            placeholder="Role Name"
            value={formData.name}
            onChange={handleChange}
          />
          {apiError.name && (
            <p className="text-red-500 text-sm ml-2 mb-2">{apiError.name}</p>
          )}

          <label className="ml-2 opacity-85 font-normal mt-4 block">
            Permissions:
          </label>

          {formData.permission.map((perm, index) => (
            <div key={index} className="border p-4 mt-2 rounded-lg relative">
              <button
                type="button"
                onClick={() => handleDeletePermission(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                title="Delete this permission"
              >
                ✕
              </button>

              {/* <input
                className="w-3/4 h-10 mt-1 mb-1 border rounded-xl pl-4 border-gray-500"
                type="text"
                placeholder="Section Name"
                value={perm.sectionName}
                onChange={(e) =>
                  handlePermissionChange(index, "sectionName", e.target.value)
                }
              /> */}
              <Select
                showSearch
                placeholder="Select Section"
                className="w-3/4 h-10"
                value={perm.sectionName || undefined}
                loading={sectionLoading}
                onSearch={(value) => fetchSections(value)}
                onChange={(value) =>
                  handlePermissionChange(index, "sectionName", value)
                }
                filterOption={false}
              >
                {sectionOptions.map((item) => (
                  <Option key={item._id} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
              {apiError[`sectionName_${index}`] && (
                <p className="text-red-500 text-sm ml-2">
                  {apiError[`sectionName_${index}`]}
                </p>
              )}
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isCreate}
                    onChange={() => handleCheckboxChange(index, "isCreate")}
                  />{" "}
                  Create
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isRead}
                    onChange={() => handleCheckboxChange(index, "isRead")}
                  />{" "}
                  Read
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isUpdate}
                    onChange={() => handleCheckboxChange(index, "isUpdate")}
                  />{" "}
                  Update
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={perm.isDelete}
                    onChange={() => handleCheckboxChange(index, "isDelete")}
                  />{" "}
                  Delete
                </label>
              </div>
            </div>
          ))}

          {/* Move Add Permission button here */}
          <div className=" flex justify-end">
            <button
              type="button"
              className="bg-red-500 text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-2 mt-6  text-sm px-4  rounded hover:bg-red-600"
              onClick={handleAddPermission}
            >
              + Add Permission
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 bg-primary text-white hover:scale-105 active:scale-95 transition-transform duration-500 py-3 mt-6 rounded-2xl"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRole;
