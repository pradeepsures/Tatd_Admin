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
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal, Switch } from "antd";
import xlsx from "json-as-xlsx";
import { Select } from "antd";

const { Option } = Select;

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";
import { useAuth } from "../../auth/AuthContext";
import {
  getAllEtsRouteShift,
  deleteEtsRouteShiftApi,
  toggleEtsRouteShiftStatusApi,
} from "../../Services/EtsRouteShift";

import { getAllEtsRoutes } from "../../Services/EtsRouteApi";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function EtsRouteShiftList() {
  const navigate = useNavigate();
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [toggleLoading, setToggleLoading] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState({
    etsRoute: "",
    shiftName: "",
    isActive: "",
  });

  const [localFilters, setLocalFilters] = useState({ ...filters });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // ✅ FETCH ROUTES (for filter dropdown)
  useEffect(() => {
    const fetchRoutes = async () => {
      const res = await getAllEtsRoutes({ page: 1, rowsPerPage: 100 });
      if (res?.status) setRoutes(res.data);
    };
    fetchRoutes();
  }, []);

  // ✅ FETCH SHIFT LIST
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllEtsRouteShift({
        page,
        rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        const formatted = res.data.map((item) => ({
          ...item,
          id: item._id,
          stoppageCount: item?.stoppageTimes?.length || 0,
        }));

        setData(formatted);
        setTotalPages(res.totalPage);
        setTotalRecord(res.totalResult);
      }
    } catch {
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ APPLY FILTER
  const handleApply = () => {
    setFilters(localFilters);
    setPage(1);
  };

  // ✅ RESET
  const handleReset = () => {
    const empty = { etsRoute: "", shiftName: "", isActive: "" };
    setLocalFilters(empty);
    setFilters(empty);
    setPage(1);
  };

  // MENU
  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
  };

  // DELETE
  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Shift",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        const res = await deleteEtsRouteShiftApi(id);
        if (res?.status) {
          toast.success("Deleted");
          fetchData();
        }
      },
    });
  };

  // TOGGLE
  const handleToggle = async (id) => {
    try {
      setToggleLoading(id);
      const res = await toggleEtsRouteShiftStatusApi(id);
      if (res?.status) {
        toast.success("Status updated");
        fetchData();
      }
    } finally {
      setToggleLoading(null);
    }
  };

  // EXPORT
  const exportExcel = () => {
    if (data.length < 1) return toast.error("No data");

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Route Shift",
        columns: [
          { label: "Route Name", value: (r) => r?.etsRoute?.name },
          { label: "Shift Name", value: "shiftName" },
          { label: "Price", value: "price" },
          { label: "GST", value: "gst" },
          { label: "Stoppages", value: "stoppageCount" },
          {
            label: "Status",
            value: (r) => (r.isActive ? "Active" : "Inactive"),
          },
          {
            label: "Created At",
            value: (r) => new Date(r.createdAt).toLocaleString(),
          },
        ],
        content: data,
      },
    ];

    xlsx(exportData, { fileName: "ETS_Route_Shift_List" });

    setIsExporting(false);
  };

  if (authLoading.profile) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

      {/* FILTER */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Search & Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ROUTE */}
          <Select
            showSearch
            placeholder="Select Route"
            value={localFilters.etsRoute || undefined}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, etsRoute: val })
            }
            className="custom-select"
          >
            {routes.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name}
              </Option>
            ))}
          </Select>

          {/* SHIFT NAME */}
          <input
            type="text"
            placeholder="Search shift name"
            className="border p-2 rounded-2xl"
            value={localFilters.shiftName}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, shiftName: e.target.value })
            }

          />

          {/* STATUS */}
          <select
            className="border p-2 rounded-2xl"
            value={localFilters.isActive}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, isActive: e.target.value })
            }
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 mt-5">
          <motion.button onClick={handleApply} className="bg-primary text-white px-5 py-2 rounded-lg">
            Apply Filters
          </motion.button>

          <motion.button onClick={handleReset} className="bg-gray-400 text-white px-5 py-2 rounded-lg">
            Reset
          </motion.button>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-4 mb-6">
        <motion.button onClick={exportExcel} className="bg-green-600 text-white px-5 py-2 rounded-lg">
          {isExporting ? <LoderBtn /> : "Export Excel"}
        </motion.button>

        {hasPermission("EtsRouteShifts", "create") && (
          <motion.button onClick={() => navigate("/home/etsRouteShifts/create")} className="bg-primary text-white px-5 py-2 rounded-lg">
            Add Shift
          </motion.button>
        )}
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>ROUTE</StyledTableCell>
              <StyledTableCell>SHIFT NAME</StyledTableCell>
              <StyledTableCell>PRICE</StyledTableCell>
              <StyledTableCell>STOPPAGES</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell>CREATED AT</StyledTableCell>
              <StyledTableCell align="center">ACTIONS</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row?.etsRoute?.name}</TableCell>
                <TableCell>{row.shiftName}</TableCell>
                <TableCell>₹ {row.price}</TableCell>
                <TableCell>{row.stoppageCount}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.isActive}
                      loading={toggleLoading === row.id}
                      onChange={() => handleToggle(row.id)}
                    />
                    <span className={row.isActive ? "text-green-600" : "text-red-600"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedRowId === row.id}
                    onClose={handleMenuClose}
                  >
                    {hasPermission("EtsRouteShifts", "read") && (
                      <MenuItem onClick={() => navigate(`view/${row.id}`)}>
                        <EyeIcon className="h-5 w-5 mr-2 text-blue-600" /> View
                      </MenuItem>
                    )}

                    {hasPermission("EtsRouteShifts", "update") && (
                      <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                        <PencilIcon className="h-5 w-5 mr-2 text-green-600" /> Edit
                      </MenuItem>
                    )}

                    {hasPermission("EtsRouteShifts", "delete") && (
                      <MenuItem onClick={() => deleteHandler(row.id)}>
                        <TrashIcon className="h-5 w-5 mr-2 text-red-600" /> Delete
                      </MenuItem>
                    )}
                    {/* <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem onClick={() => navigate(`view/${row.id}`)}>
                      <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      View
                    </MenuItem>

                    <MenuItem onClick={() => deleteHandler(row.id)}>
                      <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                      Delete
                    </MenuItem> */}
                  </Menu>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" mt={6}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Stack>
      )}
    </div>
  );
}