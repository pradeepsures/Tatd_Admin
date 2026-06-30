<<<<<<< HEAD
import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
=======
// import * as React from "react";
import React, { useEffect, useState, useCallback } from "react";
// import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Stack,
} from "@mui/material";

>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64
import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";
<<<<<<< HEAD
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";
=======
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

<<<<<<< HEAD
import { getAllDrivers, deleteDriver, updateDriver } from "../../Services/DriverApi";
import { useAuth } from "../../auth/AuthContext";
import { StyledTableCell } from "../../compoents/TableComponents";

export default function DriverList() {
    const { hasPermission, loading: authLoading } = useAuth();
    const SECTION = "Driver";
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
=======
import { getAllDrivers, deleteDriver } from "../../Services/DriverApi";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    color: "#374151",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "0.2s",
  },
}));

export default function DriverList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [stats, setStats] = useState(null);

  // SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

<<<<<<< HEAD
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const showUnverifiedOnly = searchParams.get("verified") === "pending";
=======
  // FILTER PANEL (draft)
  const [showFilters, setShowFilters] = useState(false);
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64

  const [filters, setFilters] = useState({
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    startDate: "",
    endDate: "",
  });

  // ✅ APPLIED FILTERS (only used for API)
  const [appliedFilters, setAppliedFilters] = useState({
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

<<<<<<< HEAD
            const result = await getAllDrivers({
                page,
                rowsPerPage,
                searchQuery,
                isVerified: showUnverifiedOnly ? false : undefined,
            });
=======
  const navigate = useNavigate();
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64

  // FETCH
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllDrivers({
        page,
        limit: rowsPerPage,
        search: searchQuery,
        isVerified: appliedFilters.isVerified || undefined,
        isOnline: appliedFilters.isOnline || undefined,
        isAvailable: appliedFilters.isAvailable || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      });

      if (result?.status) {
        setData(result.data.map((i) => ({ ...i, id: i._id })));
        setTotalPages(result.totalPage);
        setTotalRecord(result.totalResult);
        setStats(result.stats);
      }
    } catch (err) {
      toast.error("Error fetching drivers");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, appliedFilters]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // SEARCH
  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  // APPLY FILTER
  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters); // ✅ apply only on click
    setShowFilters(false);
  };

  // CLEAR FILTER
  const clearFilters = () => {
    const reset = {
      isVerified: "",
      isOnline: "",
      isAvailable: "",
      startDate: "",
      endDate: "",
    };

    setFilters(reset);
    setAppliedFilters(reset); // ✅ remove applied filters too
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
    setShowFilters(false);
  };

<<<<<<< HEAD
        }

    }, [page, rowsPerPage, searchQuery, showUnverifiedOnly]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const handleActionOpen = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedRowId(id);
    };

    const handleActionClose = () => {
        setAnchorEl(null);
        setSelectedRowId(null);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const deleteHandler = (id) => {

        Modal.confirm({
            title: "Delete Driver",
            content: "Are you sure you want to delete this Driver?",
            okType: "danger",

            onOk: async () => {

                try {

                    const result = await deleteDriver(id);

                    if (result?.status) {

                        toast.success("Driver deleted");
                        fetchDrivers();

                    }

                } catch (err) {

                    toast.error("Error deleting Driver");

                }

            }
        });

    };

    const handleAddDriver = () => {

        setIsLoading(true);

        setTimeout(() => {

            navigate("createDriver");
            setIsLoading(false);

        }, 300);

    };

    const toggleVerifyDriver = async (id, currentStatus) => {
        try {
            const formData = new FormData();
            formData.append("isVerified", !currentStatus);
            
            const result = await updateDriver(id, formData);
            if(result?.status) {
                toast.success(`Driver ${!currentStatus ? 'Verified' : 'Unverified'}`);
                fetchDrivers();
            }
        } catch(err) {
            toast.error("Failed to update driver status");
        }
        handleActionClose();
    };

    const exportExcel = async () => {

        if (data.length < 1) {
            return toast.error("Driver list empty");
        }

        setIsExporting(true);

        const settings = {
            fileName: "Driver_List"
        };

        const exportData = [
            {
                sheet: "Drivers",
                columns: [
                    { label: "Name", value: "name" },
                    { label: "Email", value: "email" },
                    { label: "Phone", value: "phone" },
                    { label: "Region", value: (row) => row?.region?.name },
                    { label: "Online", value: (row) => row?.isOnline ? "Yes" : "No" },
                    { label: "Verified", value: (row) => row?.isVerified ? "Yes" : "No" },
                    { label: "Total Rides", value: "totalRides" },
                ],
                content: data
            }
        ];

        try {

            xlsx(exportData, settings);
            toast.success("Excel exported");

        } catch {

            toast.error("Export failed");

        } finally {

            setIsExporting(false);

        }

    };

    if (authLoading) return <Loader />;
    if (loading) return <Loader />;

    return (

        <div className="p-6 bg-gray-50 min-h-screen">

            <div className="flex justify-between items-center mb-4">

                {/* LEFT */}
                <Breaker />

                {showUnverifiedOnly && (
                    <span className="text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg">
                        Showing unverified drivers only
                    </span>
                )}

                {/* RIGHT */}
                {stats && (
                    <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white shadow-md rounded-lg px-4 py-2 text-sm flex items-center gap-3 flex-wrap">

                        <span>
                            <span className="opacity-80">Total:</span>{" "}
                            <span className="font-semibold">{stats.total}</span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">Verified:</span>{" "}
                            <span className="font-semibold text-green-300">
                                {stats.verifiedCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">Unverified:</span>{" "}
                            <span className="font-semibold text-red-300">
                                {stats.unverifiedCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">Online:</span>{" "}
                            <span className="font-semibold text-blue-300">
                                {stats.onlineCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">PunchedIn:</span>{" "}
                            <span className="font-semibold text-blue-300">
                                {stats.punchedInCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">PunchedOut:</span>{" "}
                            <span className="font-semibold text-blue-300">
                                {stats.punchedOutCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">Available:</span>{" "}
                            <span className="font-semibold text-blue-300">
                                {stats.availableCount}
                            </span>
                        </span>



                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">On Trip:</span>{" "}
                            <span className="font-semibold text-yellow-300">
                                {stats.onTripCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">Assigned:</span>{" "}
                            <span className="font-semibold text-purple-300">
                                {stats.assignedCount}
                            </span>
                        </span>

                        <span className="opacity-50">|</span>

                        <span>
                            <span className="opacity-80">UnAssigned:</span>{" "}
                            <span className="font-semibold text-purple-300">
                                {stats.unAssignedCount}
                            </span>
                        </span>

                    </div>
                )}

            </div>

            {/* TOP BAR */}

            <div className="flex justify-between items-center mb-8">

                <div className="flex gap-3">

                    <input
                        type="text"
                        placeholder="Search name / email / phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80 px-4 py-2 border rounded-lg"
                    />

                    <button
                        onClick={() => {
                            setSearchQuery(search);
                            setPage(1);
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Search
                    </button>

                </div>

                <div className="flex gap-4">

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={exportExcel}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg"
                    >
                        {isExporting ? <LoderBtn /> : "Export Excel"}
                    </motion.button>

                    {/* <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddDriver}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        {isLoading ? <LoderBtn /> : "Add Driver"}
                    </motion.button> */}

                    {hasPermission(SECTION, "create") && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddDriver}
                            className="bg-primary text-white px-5 py-2 rounded-lg"
                        >
                            {isLoading ? <LoderBtn /> : "Add Driver"}
                        </motion.button>
                    )}

                </div>

            </div>

            {/* TABLE */}

            <TableContainer component={Paper} className="rounded-xl shadow">

                <Table>
                    <TableHead>
                        <TableRow>

                            <StyledTableCell>S.No</StyledTableCell>

                            <StyledTableCell>PROFILE</StyledTableCell>

                            <StyledTableCell>DETAILS</StyledTableCell>

                            <StyledTableCell>RIDES</StyledTableCell>

                            <StyledTableCell>STATUS</StyledTableCell>

                            <StyledTableCell>VERIFIED</StyledTableCell>

                            <StyledTableCell align="center">Actions</StyledTableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {data.length === 0 ? (

                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No Drivers Found
                                </TableCell>
                            </TableRow>

                        ) : (

                            data.map((row, index) => (

                                <TableRow key={row.id}>

                                    {/* SERIAL NUMBER */}
                                    <TableCell>
                                        {(page - 1) * rowsPerPage + index + 1}
                                    </TableCell>

                                    {/* PROFILE PIC */}
                                    <TableCell>

                                        <img
                                            src={row?.profilePic || "/no-image.png"}
                                            alt="profile"
                                            className="w-12 h-12 rounded-full object-cover border"
                                        />

                                    </TableCell>

                                    {/* DETAILS */}
                                    <TableCell>

                                        <div className="flex flex-col">

                                            <span className="font-semibold text-gray-800">
                                                {/* {row.name} */}
                                                {[row.name, row.midName, row.lastName].filter(Boolean).join(" ")}
                                            </span>

                                            <span className="text-sm text-gray-500">
                                                {row.email}
                                            </span>

                                            <span className="text-sm text-gray-500">
                                                {row.phone}
                                            </span>

                                        </div>

                                    </TableCell>

                                    {/* RIDES */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">{row.totalRides || 0} Rides</span>
                                            <button
                                                onClick={() => {
                                                    navigate(`driverBookingView/${row.id}`);
                                                }}
                                                className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="View Trips"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                row.isOnline
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {row.isOnline ? "🟢 Online" : "⚫ Offline"}
                                        </span>
                                    </TableCell>

                                    {/* VERIFIED */}
                                    <TableCell>

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${row.isVerified
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {row.isVerified ? "Verified" : "Pending"}
                                        </span>

                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleActionOpen(e, row.id)}
                                            aria-label="Driver actions"
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && selectedRowId === row.id}
                                            onClose={handleActionClose}
                                        >
                                            {hasPermission(SECTION, "read") && (
                                                <MenuItem
                                                    onClick={() => {
                                                        navigate(`driverView/${row.id}`);
                                                        handleActionClose();
                                                    }}
                                                >
                                                    <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                    View Profile
                                                </MenuItem>
                                            )}
                                            {hasPermission(SECTION, "update") && (
                                                <>
                                                    <MenuItem
                                                        onClick={() => {
                                                            navigate(`updateDriver/${row.id}`);
                                                            handleActionClose();
                                                        }}
                                                    >
                                                        <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                        Edit Driver
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => toggleVerifyDriver(row.id, row.isVerified)}
                                                    >
                                                        {row.isVerified ? (
                                                            <XCircleIcon className="h-5 w-5 text-orange-600 mr-2" />
                                                        ) : (
                                                            <CheckCircleIcon className="h-5 w-5 text-orange-600 mr-2" />
                                                        )}
                                                        {row.isVerified ? "Revoke Verification" : "Verify Driver"}
                                                    </MenuItem>
                                                </>
                                            )}
                                            {hasPermission(SECTION, "read") && (
                                                <MenuItem
                                                    onClick={() => {
                                                        navigate(`driverBookingView/${row.id}`);
                                                        handleActionClose();
                                                    }}
                                                >
                                                    <EyeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                                    View Trips
                                                </MenuItem>
                                            )}
                                            {hasPermission(SECTION, "delete") && (
                                                <MenuItem
                                                    onClick={() => {
                                                        handleActionClose();
                                                        deleteHandler(row.id);
                                                    }}
                                                    sx={{ color: "error.main" }}
                                                >
                                                    <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                    Delete Driver
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

            {totalRecord > rowsPerPage && (

                <Stack spacing={2} alignItems="center" mt={6}>

                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                    />

                </Stack>

            )}

=======
  const deleteHandler = async (id) => {
    try {
      const res = await deleteDriver(id);
      if (res?.status) {
        toast.success("Driver deleted");
        fetchDrivers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePageChange = (e, value) => setPage(value);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <Breaker />

        {stats && (
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-4 py-2 rounded-lg text-sm flex gap-3 flex-wrap">
            <span>Total: {stats.total}</span>
            <span>Verified: {stats.verifiedCount}</span>
            <span>Unverified: {stats.unverifiedCount}</span>
            <span>Online: {stats.onlineCount}</span>
          </div>
        )}
      </div>

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6">
        {/* SEARCH */}
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name / email / phone"
            className="border px-3 py-2 rounded w-80"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Search
          </button>
>>>>>>> 4c448d3b85c64ab16592eaa9d5b3f1ba21dd9e64
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>

          {/* CLEAR ONLY */}
          <button
            onClick={clearFilters}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear
          </button>

          <button
            onClick={() => navigate("createDriver")}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            + Create Driver
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3">
          <select
            value={filters.isVerified}
            onChange={(e) =>
              setFilters({ ...filters, isVerified: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Verified</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            value={filters.isOnline}
            onChange={(e) =>
              setFilters({ ...filters, isOnline: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Online</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            value={filters.isAvailable}
            onChange={(e) =>
              setFilters({ ...filters, isAvailable: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Available</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border p-2 rounded"
          />

          {/* APPLY */}
          <button
            onClick={applyFilters}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>

          {/* CLEAR ONLY */}
          {/* <button
                        onClick={clearFilters}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Clear
                    </button> */}
        </div>
      )}

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Profile</StyledTableCell>
              <StyledTableCell>Details</StyledTableCell>
              <StyledTableCell>Address</StyledTableCell>
              <StyledTableCell>Verified</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No Drivers Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  {/* S.NO */}
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>

                  {/* PROFILE */}
                  <TableCell>
                    <img
                      src={row.profilePic || "/no-image.png"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>

                  {/* DETAILS */}
                  <TableCell>
                    <div>
                      <div className="font-semibold">
                        {[row.name, row.midName, row.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {row.email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500">{row.phone}</div>
                    </div>
                  </TableCell>

                  {/* address */}
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {row.permanentAddress || "No Adress"}
                    </div>
                  </TableCell>

                  {/* VERIFIED */}
                  <TableCell>
                    <span
                      className={
                        row.isVerified ? "text-green-600" : "text-red-600"
                      }
                    >
                      {row.isVerified ? "Verified" : "Pending"}
                    </span>
                  </TableCell>

                  {/* ACTIONS (3 DOT MENU) */}
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedRowId(row.id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={() => {
                        setAnchorEl(null);
                        setSelectedRowId(null);
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          navigate(`driverView/${row.id}`);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <EyeIcon className="w-5 h-5 text-blue-600 mr-2" />
                        View
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          navigate(`updateDriver/${row.id}`);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <PencilIcon className="w-5 h-5 text-green-600 mr-2" />
                        Edit
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          deleteHandler(row.id);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <TrashIcon className="w-5 h-5 text-red-600 mr-2" />
                        Delete
                      </MenuItem>
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
        <Stack spacing={2} alignItems="center" mt={3}>
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
