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
import { Modal } from "antd";
import xlsx from "json-as-xlsx";
import { Select } from "antd";
import { useAuth } from "../../auth/AuthContext";
const { Option } = Select;

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";

import { getEtsUserStopPagesApi } from "../../Services/EtsUserStopPages";
import { getAllEtsRoutes } from "../../Services/EtsRouteApi";
import { getAllEtsUsers } from "../../Services/EtsUserApi";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function EtsUserStoppageList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    user: "",
    route: "",
    isActive: "",
  });

  const [localFilters, setLocalFilters] = useState({ ...filters });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // ✅ FETCH DROPDOWNS
  useEffect(() => {
    const fetchDropdowns = async () => {
      const r = await getAllEtsRoutes({ page: 1, rowsPerPage: 100 });
      const u = await getAllEtsUsers({ rowsPerPage: 100 });

      if (r?.status) setRoutes(r.data);
      if (u?.status) setUsers(u.data);
    };
    fetchDropdowns();
  }, []);

  // ✅ FETCH LIST
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getEtsUserStopPagesApi({
        page,
        limit: rowsPerPage,
        ...filters,
      });

      if (res?.status) {
        setData(res.data);
        setTotalPages(res.totalPage);
        setTotalRecord(res.totalResult);
      }
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FILTER
  const handleApply = () => {
    setFilters(localFilters);
    setPage(1);
  };

  const handleReset = () => {
    const empty = { user: "", route: "", isActive: "" };
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

  const handlePageChange = (_, newPage) => setPage(newPage);

  // DELETE
  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Assignment",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        // 👉 call your delete API here
        toast.success("Deleted");
        fetchData();
      },
    });
  };

  // EXPORT
  const exportExcel = () => {
    if (!data.length) return toast.error("No data");

    setIsExporting(true);

    const exportData = [
      {
        sheet: "ETS User Stoppage",
        columns: [
          { label: "User", value: (r) => r.user?.name },
          { label: "Email", value: (r) => r.user?.email },
          { label: "Mobile", value: (r) => r.user?.mobile },
          { label: "Route", value: (r) => r.route?.name },
          { label: "Boarding", value: (r) => r.boardingStoppage?.name },
          { label: "Dropping", value: (r) => r.droppingStoppage?.name },
          {
            label: "Status",
            value: (r) => (r.isActive ? "Active" : "Inactive"),
          },
        ],
        content: data,
      },
    ];

    xlsx(exportData, { fileName: "ETS_User_Stoppage" });
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

          {/* USER */}
          <Select
            placeholder="Select User"
            value={localFilters.user || undefined}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, user: val })
            }
            className="custom-select"
            showSearch
          >
            {users.map((u) => (
              <Option key={u._id} value={u._id}>
                {u.name}
              </Option>
            ))}
          </Select>

          {/* ROUTE */}
          <Select
            placeholder="Select Route"
            value={localFilters.route || undefined}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, route: val })
            }
            className="custom-select"
            showSearch
          >
            {routes.map((r) => (
              <Option key={r._id} value={r._id}>
                {r.name}
              </Option>
            ))}
          </Select>

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

        {/* <motion.button onClick={() => navigate("create")} className="bg-primary text-white px-5 py-2 rounded-lg">
          Add Assignment
        </motion.button> */}
        {hasPermission("EtsUserStopPages", "create") && (
          <motion.button
            onClick={() => navigate("create")}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Add EtsUsertoPage
          </motion.button>
        )}
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>USER</StyledTableCell>
              <StyledTableCell>ROUTE</StyledTableCell>
              <StyledTableCell>BOARDING</StyledTableCell>
              <StyledTableCell>DROPPING</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell align="center">ACTIONS</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row._id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>

                {/* USER INFO */}
                <TableCell>
                  <div>
                    <div className="font-semibold">{row.user?.name}</div>
                    <div className="text-sm text-gray-500">{row.user?.email}</div>
                    <div className="text-sm text-gray-500">{row.user?.mobile}</div>
                  </div>
                </TableCell>

                <TableCell>{row.route?.name}</TableCell>
                <TableCell>{row.boardingStoppage?.name}</TableCell>
                <TableCell>{row.droppingStoppage?.name}</TableCell>

                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-sm ${row.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuOpen(e, row._id)}>
                    <MoreVertIcon />
                  </IconButton>

                  {/* <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedRowId === row._id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                      <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      View
                    </MenuItem>

                    <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem onClick={() => deleteHandler(row._id)}>
                      <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                      Delete
                    </MenuItem>
                  </Menu> */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedRowId === row._id}
                    onClose={handleMenuClose}
                  >
                    {hasPermission("EtsUserStopPages", "read") && (
                      <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                        <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                        View
                      </MenuItem>
                    )}

                    {hasPermission("EtsUserStopPages", "update") && (
                      <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                        <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                        Edit
                      </MenuItem>
                    )}

                    {hasPermission("EtsUserStopPages", "delete") && (
                      <MenuItem onClick={() => deleteHandler(row._id)}>
                        <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                        Delete
                      </MenuItem>
                    )}
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