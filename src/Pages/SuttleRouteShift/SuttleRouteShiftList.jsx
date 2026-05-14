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
import { Modal, Switch, Select } from "antd";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";

import {
  getAllShuttleRouteShifts,
  deleteShuttleRouteShiftApi,
  toggleShuttleRouteStatusApi,
} from "../../Services/SuttleRouteShiftApi";

// import { getAllEtsRoutes } from "../../Services/EtsRouteApi"; // if same route list
import { getAllShuttleRoutes } from "../../Services/ShuttleRouteApi";

const { Option } = Select;

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function ShuttleRouteShiftList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
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
    shuttleRoute: "",
    shiftName: "",
    isActive: "",
  });

  const [localFilters, setLocalFilters] = useState({ ...filters });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // ✅ FETCH ROUTES (for dropdown)
  useEffect(() => {
    const fetchRoutes = async () => {
      const res = await getAllShuttleRoutes({ page: 1, rowsPerPage: 100 });
      if (res?.status) setRoutes(res.data);
    };
    fetchRoutes();
  }, []);

  // ✅ FETCH DATA
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllShuttleRouteShifts({
        page,
        rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        const formatted = res.data.map((item) => ({
          ...item,
          id: item._id,
          routeName: item?.shuttleRoute?.name,
          stoppageCount: item?.stoppageTimes?.length || 0,
          price:
            item?.stoppageTimes?.[0]?.price || 0, // first price
        }));

        setData(formatted);
        setTotalPages(res.totalPage);
        setTotalRecord(res.totalResult);
      }
    } catch {
      toast.error("Failed to fetch shuttle shifts");
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
    const empty = { shuttleRoute: "", shiftName: "", isActive: "" };
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
        const res = await deleteShuttleRouteShiftApi(id);
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
      const res = await toggleShuttleRouteStatusApi(id);
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
        sheet: "Shuttle Route Shift",
        columns: [
          { label: "Route Name", value: "routeName" },
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

    xlsx(exportData, { fileName: "Shuttle_Route_Shift_List" });

    setIsExporting(false);
  };

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
            className="custom-select"
            placeholder="Select Route"
            value={localFilters.shuttleRoute || undefined}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, shuttleRoute: val })
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {routes.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name || "Unnamed Route"}
              </Option>
            ))}
          </Select>
          {/* <Select
            showSearch
            placeholder="Select Route"
            value={localFilters.shuttleRoute || undefined}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, shuttleRoute: val })
            }
          >
            {routes.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name}
              </Option>
            ))}
          </Select> */}

          {/* SHIFT */}
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
          <motion.button
            onClick={handleApply}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Apply Filters
          </motion.button>

          <motion.button
            onClick={handleReset}
            className="bg-gray-400 text-white px-5 py-2 rounded-lg"
          >
            Reset
          </motion.button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 mb-6">
        <motion.button
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          {isExporting ? <LoderBtn /> : "Export Excel"}
        </motion.button>
        {hasPermission("ShuttleRouteShift", "create") && (
          <motion.button
            onClick={() => navigate("/home/shuttleRoutes/create")}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Add Shift
          </motion.button>
        )}
        {/* <motion.button
          onClick={() =>
            navigate("/home/shuttleRouteShifts/create")
          }
          className="bg-primary text-white px-5 py-2 rounded-lg"
        >
          Add Shift
        </motion.button> */}
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
                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>

                <TableCell>{row.routeName}</TableCell>
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
                    <span
                      className={
                        row.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, row.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={
                      Boolean(anchorEl) &&
                      selectedRowId === row.id
                    }
                    onClose={handleMenuClose}
                  >
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row._id}
                      onClose={handleMenuClose}
                    >
                      {hasPermission("ShuttleRouteShift", "read") && (
                        <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                          <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                          View
                        </MenuItem>
                      )}

                      {hasPermission("ShuttleRouteShift", "update") && (
                        <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                          <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                          Edit
                        </MenuItem>
                      )}

                      {hasPermission("ShuttleRouteShift", "delete") && (
                        <MenuItem onClick={() => deleteHandler(row._id)}>
                          <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                          Delete
                        </MenuItem>
                      )}
                    </Menu>
                    {/* <MenuItem
                      onClick={() => navigate(`update/${row.id}`)}
                    >
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate(`view/${row.id}`)}
                    >
                      <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      View
                    </MenuItem>

                    <MenuItem
                      onClick={() => deleteHandler(row.id)}
                    >
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