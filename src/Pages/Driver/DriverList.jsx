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
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

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

    const [isExporting, setIsExporting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

  // SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const showUnverifiedOnly = searchParams.get("verified") === "pending";

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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-80 px-4 py-2 border rounded-lg"
                    />

                    <button
                        onClick={() => {
                            setSearchQuery(searchInput);
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

        </div>
  );
}
