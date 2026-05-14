import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

import {
  getAllEtsUsers,
  deleteEtsUserApi,
} from "../../Services/EtsUserApi";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
};

export default function EtsUserList() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // ✅ FILTER STATES
  const [filters, setFilters] = useState({
    search: "",
    isVerified: "",
    isDeleted: "",
    startDate: "",
    endDate: "",
    startDateFormatted: "",
    endDateFormatted: "",
  });

  const [localFilters, setLocalFilters] = useState({ ...filters });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  // ✅ FETCH USERS
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllEtsUsers({
        page,
        rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        const formatted = res.data.map((item) => ({
          ...item,
          id: item._id,
        }));

        setData(formatted);
        setTotalPages(res.totalPage);
        setTotalRecord(res.totalResult);
      }

    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // MENU
  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  // DELETE
  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        const res = await deleteEtsUserApi(id);
        if (res?.status) {
          toast.success("Deleted");
          fetchUsers();
        }
      },
    });
  };

  // EXPORT
  const exportExcel = () => {
    if (!data.length) return toast.error("Empty");

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Users",
        columns: [
          { label: "Name", value: "name" },
          { label: "Email", value: "email" },
          { label: "Mobile", value: "mobile" },
          { label: "City", value: "city" },
          {
            label: "Verified",
            value: (r) => (r.isVerified ? "Yes" : "No"),
          },
        ],
        content: data,
      },
    ];

    xlsx(exportData, { fileName: "ETS_Users" });
    setIsExporting(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <Breaker />

      {/* ✅ FILTER UI (NEW LIKE HOLIDAY) */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <h3 className="text-lg font-semibold mb-4">Search & Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Search name / email / mobile"
            className="border p-2 rounded-lg"
            value={localFilters.search}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, search: e.target.value })
            }
          />

          {/* START DATE */}
          <input
            type={localFilters.startDate ? "date" : "text"}
            placeholder="Start Date"
            className="border p-2 rounded-lg"
            value={localFilters.startDate || ""}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text";
            }}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalFilters((prev) => ({
                ...prev,
                startDate: raw,
                startDateFormatted: formatDate(raw),
              }));
            }}
          />

          {/* END DATE */}
          <input
            type={localFilters.endDate ? "date" : "text"}
            placeholder="End Date"
            className="border p-2 rounded-lg"
            value={localFilters.endDate || ""}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text";
            }}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalFilters((prev) => ({
                ...prev,
                endDate: raw,
                endDateFormatted: formatDate(raw),
              }));
            }}
          />

          {/* <input
            type="date"
            className="border p-2 rounded-lg"
            value={localFilters.startDate}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, startDate: e.target.value })
            }
          />

          <input
            type="date"
            className="border p-2 rounded-lg"
            value={localFilters.endDate}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, endDate: e.target.value })
            }
          /> */}

          <select
            className="border p-2 rounded-lg"
            value={localFilters.isVerified}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, isVerified: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <select
            className="border p-2 rounded-lg"
            value={localFilters.isDeleted}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, isDeleted: e.target.value })
            }
          >
            <option value="">All Users</option>
            <option value="true">Deleted</option>
            <option value="false">Active</option>
          </select>

        </div>

        <div className="flex gap-3 mt-5">

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFilters({
                ...localFilters,
                startDate: localFilters.startDateFormatted || "",
                endDate: localFilters.endDateFormatted || "",
              });
              setPage(1);
            }}
            // onClick={() => {
            //   setFilters(localFilters);
            //   setPage(1);
            // }}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Apply Filters
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const empty = {
                search: "",
                isVerified: "",
                isDeleted: "",
                startDate: "",
                endDate: "",
                startDateFormatted: "",
                endDateFormatted: "",
              };
              setLocalFilters(empty);
              setFilters(empty);
              setPage(1);
            }}
            className="bg-gray-400 text-white px-5 py-2 rounded-lg"
          >
            Reset
          </motion.button>

        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 mb-6">

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          {isExporting ? <LoderBtn /> : "Export Excel"}
        </motion.button>

        {hasPermission("EtsUsers", "create") && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("create")}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            {btnLoading ? <LoderBtn /> : "Add User"}
          </motion.button>
        )}
        {/* <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("create")}
          className="bg-primary text-white px-5 py-2 rounded-lg"
        >
          {btnLoading ? <LoderBtn /> : "Add User"}
        </motion.button> */}

      </div>

      {/* TABLE */}
      <TableContainer component={Paper} className="rounded-xl shadow">

        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>PROFILE</StyledTableCell>
              <StyledTableCell>DETAILS</StyledTableCell>
              <StyledTableCell>CITY</StyledTableCell>
              <StyledTableCell>VERIFIED</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Users Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id}>

                  <TableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <img
                      src={row.profilePic || "/no-image.png"}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{row.name}</span>
                      <span className="text-sm text-gray-500">{row.email}</span>
                      <span className="text-sm text-gray-500">{row.mobile}</span>
                    </div>
                  </TableCell>

                  <TableCell>{row.city || "N/A"}</TableCell>

                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${row.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {row.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </TableCell>

                  <TableCell align="center">

                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                      <MoreVertIcon />
                    </IconButton>

                    {/* <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                    >

                      <MenuItem onClick={() => navigate(`view/${row.id}`)}>
                        <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
                        View
                      </MenuItem>

                      <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                        <PencilIcon className="h-5 w-5 mr-2 text-green-600" />
                        Edit
                      </MenuItem>

                      <MenuItem onClick={() => deleteHandler(row.id)}>
                        <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                        Delete
                      </MenuItem>

                    </Menu> */}

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                    >
                      {hasPermission("EtsUsers", "read") && (
                        <MenuItem onClick={() => navigate(`view/${row.id}`)}>
                          <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
                          View
                        </MenuItem>
                      )}

                      {hasPermission("EtsUsers", "update") && (
                        <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                          <PencilIcon className="h-5 w-5 mr-2 text-green-600" />
                          Edit
                        </MenuItem>
                      )}

                      {hasPermission("EtsUsers", "delete") && (
                        <MenuItem onClick={() => deleteHandler(row.id)}>
                          <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                          Delete
                        </MenuItem>
                      )}
                    </Menu>

                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>

        </Table>

      </TableContainer>

      {/* PAGINATION */}
      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" mt={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>
      )}

    </div>
  );
}