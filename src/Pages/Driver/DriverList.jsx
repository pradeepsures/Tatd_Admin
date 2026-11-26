import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, CurrencyRupeeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

import { getAllDrivers, deleteDriver, updateDriver } from "../../Services/DriverApi";
import { getAllStates } from "../../Services/StatesApi";
import { getAllCities } from "../../Services/CitiesApi";
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
  const [searchInput, setSearchInput] = useAdminListState("searchInput", "");
  const [searchQuery, setSearchQuery] = useAdminListState("searchQuery", "");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [stats, setStats] = useState(null);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const showUnverifiedOnly = searchParams.get("verified") === "pending";

  const [filters, setFilters] = useAdminListState("filters", {
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    state: "",
    city: "",
    startDate: "",
    endDate: "",
  });

  // ✅ APPLIED FILTERS (only used for API)
  const [appliedFilters, setAppliedFilters] = useAdminListState("appliedFilters", {
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    state: "",
    city: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useAdminListState("page", 1);
  const rowsPerPage = 10;

  useEffect(() => {
    let active = true;
    getAllStates({ page: 1, rowsPerPage: 1000 })
      .then((result) => { if (active) setStateOptions(result?.data || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const selectedState = stateOptions.find((item) => item.name === filters.state);
    if (!selectedState) {
      setCityOptions([]);
      return () => { active = false; };
    }
    setLocationsLoading(true);
    getAllCities({ page: 1, rowsPerPage: 1000, state: selectedState._id })
      .then((result) => { if (active) setCityOptions(result?.data || []); })
      .catch(() => { if (active) setCityOptions([]); })
      .finally(() => { if (active) setLocationsLoading(false); });
    return () => { active = false; };
  }, [filters.state, stateOptions]);


  // FETCH
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllDrivers({
        page,
        limit: rowsPerPage,
        search: searchQuery,
        isVerified: showUnverifiedOnly ? false : (appliedFilters.isVerified || undefined),
        isOnline: appliedFilters.isOnline || undefined,
        isAvailable: appliedFilters.isAvailable || undefined,
        state: appliedFilters.state || undefined,
        city: appliedFilters.city || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      });

      if (result?.status) {
        const lastPage = Math.max(1, result.totalPage || 1);
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }
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
  }, [page, searchQuery, appliedFilters, showUnverifiedOnly]);

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
      state: "",
      city: "",
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
            } else {
                toast.error(result?.message || "Failed to update driver status");
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

        <div className="page-shell">

            <Breaker />

            <div className="page-header">

                <div>
                    <h1 className="page-title">Drivers</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-500">{totalRecord} record{totalRecord === 1 ? "" : "s"} found</p>
                        {showUnverifiedOnly && (
                            <span className="badge-warning">
                                Showing unverified drivers only
                            </span>
                        )}
                    </div>
                </div>

                <div className="page-actions">

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={exportExcel}
                        className="btn-secondary"
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
                            className="btn-primary"
                        >
                            {isLoading ? <LoderBtn /> : "Add Driver"}
                        </motion.button>
                    )}

                </div>

            </div>

            {/* STATS */}
            {stats && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-10">

                    <div className="card px-4 py-3">
                        <p className="detail-label">Total:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{stats.total}</p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">Verified:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-emerald-600">
                            {stats.verifiedCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">Unverified:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-rose-600">
                            {stats.unverifiedCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">Online:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.onlineCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">PunchedIn:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.punchedInCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">PunchedOut:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.punchedOutCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">Available:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.availableCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">On Trip:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-amber-600">
                            {stats.onTripCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">Assigned:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.assignedCount}
                        </p>
                    </div>

                    <div className="card px-4 py-3">
                        <p className="detail-label">UnAssigned:</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {stats.unAssignedCount}
                        </p>
                    </div>

                </div>
            )}

            {/* TOOLBAR */}

            <div className="card card-pad space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    <div className="relative w-full sm:w-80">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name / email / phone"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="search-field sm:w-80"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSearchQuery(searchInput);
                            setPage(1);
                        }}
                        className="btn-primary w-full sm:w-auto"
                    >
                        Search
                    </button>

                </div>

                <div className="grid grid-cols-1 items-end gap-3 border-t border-slate-200/70 pt-4 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:flex-wrap">
                <label className="flex flex-col text-[13px] font-semibold text-slate-600 xl:w-48">
                    <span className="mb-1.5">Verification</span>
                    <select value={filters.isVerified} onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })} className="field font-normal">
                        <option value="">All drivers</option>
                        <option value="true">Verified</option>
                        <option value="false">Not verified</option>
                    </select>
                </label>
                <label className="flex flex-col text-[13px] font-semibold text-slate-600 xl:w-48">
                    <span className="mb-1.5">Availability</span>
                    <select value={filters.isOnline} onChange={(e) => setFilters({ ...filters, isOnline: e.target.value })} className="field font-normal">
                        <option value="">Online and offline</option>
                        <option value="true">Online</option>
                        <option value="false">Offline</option>
                    </select>
                </label>
                <label className="flex flex-col text-[13px] font-semibold text-slate-600 xl:w-52">
                    <span className="mb-1.5">State</span>
                    <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value, city: "" })} className="field font-normal">
                        <option value="">All states</option>
                        {stateOptions.map((state) => <option key={state._id} value={state.name}>{state.name}</option>)}
                    </select>
                </label>
                <label className="flex flex-col text-[13px] font-semibold text-slate-600 xl:w-52">
                    <span className="mb-1.5">City</span>
                    <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} disabled={!filters.state || locationsLoading} className="field font-normal disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70">
                        <option value="">{locationsLoading ? "Loading cities..." : filters.state ? "All cities" : "Select a state first"}</option>
                        {cityOptions.map((city) => <option key={city._id} value={city.name}>{city.name}</option>)}
                    </select>
                </label>
                <div className="flex gap-2.5 sm:col-span-2 lg:col-span-4 xl:col-span-1">
                <button onClick={applyFilters} className="btn-primary h-11 flex-1 xl:flex-none">Apply filters</button>
                <button onClick={clearFilters} className="btn-secondary h-11 flex-1 xl:flex-none">Clear</button>
                </div>
                </div>
            </div>

            {/* TABLE */}

            <TableContainer component={Paper}>

                <Table>
                    <TableHead>
                        <TableRow>

                            <StyledTableCell>S.No</StyledTableCell>

                            <StyledTableCell>PROFILE</StyledTableCell>

                            <StyledTableCell>DETAILS</StyledTableCell>

                            <StyledTableCell>LOCATION</StyledTableCell>

                            <StyledTableCell>ADDRESS</StyledTableCell>

                            <StyledTableCell>RIDES</StyledTableCell>

                            <StyledTableCell>STATUS</StyledTableCell>

                            <StyledTableCell>VERIFIED</StyledTableCell>
                            <StyledTableCell>WALLET</StyledTableCell>

                            <StyledTableCell align="center">Actions</StyledTableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {data.length === 0 ? (

                            <TableRow>
                                <TableCell colSpan={10} align="center" className="!py-14 !text-slate-400">
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
                                            className="h-11 w-11 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                                        />

                                    </TableCell>

                                    {/* DETAILS */}
                                    <TableCell>

                                        <div className="flex flex-col">

                                            <span className="font-semibold text-slate-800">
                                                {/* {row.name} */}
                                                {[row.name, row.midName, row.lastName].filter(Boolean).join(" ")}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {row.email}
                                            </span>

                                            <span className="text-sm text-slate-500">
                                                {row.phone}
                                            </span>
                                            
                                            {!row.policeVerificationPhoto && (
                                                <span className="badge-danger mt-1.5 w-max text-[10px]">
                                                    ⚠️ Police Verification Pending
                                                </span>
                                            )}

                                        </div>

                                    </TableCell>

                                    <TableCell>
                                        <span className="font-medium text-slate-800">
                                            {[row.city, row.state].filter(Boolean).join(", ") || "—"}
                                        </span>
                                    </TableCell>

                                    <TableCell className="min-w-64 max-w-80">
                                        <div className="space-y-1 text-sm text-slate-700">
                                            {row.currentAddress && (
                                                <div className="break-words">
                                                    <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Current</span>
                                                    {row.currentAddress}
                                                </div>
                                            )}
                                            {row.permanentAddress && row.permanentAddress !== row.currentAddress && (
                                                <div className="break-words">
                                                    <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Permanent</span>
                                                    {row.permanentAddress}
                                                </div>
                                            )}
                                            {!row.currentAddress && !row.permanentAddress && <span className="text-slate-400">—</span>}
                                        </div>
                                    </TableCell>

                                    {/* RIDES */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="whitespace-nowrap font-semibold text-slate-700">{row.totalRides || 0} Rides</span>
                                            <button
                                                onClick={() => {
                                                    navigate(`/home/driver/driverBookingView/${row.id}`);
                                                }}
                                                className="btn-icon h-8 w-8 bg-slate-900/5"
                                                title="View Trips"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell>
                                        <span
                                            className={`whitespace-nowrap ${
                                                row.isOnline
                                                    ? "badge-success"
                                                    : "badge-neutral"
                                            }`}
                                        >
                                            {row.isOnline ? "🟢 Online" : "⚫ Offline"}
                                        </span>
                                    </TableCell>

                                    {/* VERIFIED */}
                                    <TableCell>

                                        <span
                                            className={`${row.isVerified
                                                ? "badge-success"
                                                : "badge-warning"
                                                }`}
                                        >
                                            {row.isVerified ? "Verified" : "Pending"}
                                        </span>

                                    </TableCell>

                                    {/* WALLET */}
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`font-semibold ${row.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                ₹{Number(row.walletBalance || 0).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/home/driver/ledger/${row.id}`)}
                                                className="whitespace-nowrap rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                                            >
                                                View Ledger
                                            </button>
                                        </div>
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
                                            {hasPermission(SECTION, "read") && (
                                                <MenuItem
                                                    onClick={() => {
                                                        navigate(`ledger/${row.id}`);
                                                        handleActionClose();
                                                    }}
                                                >
                                                    <CurrencyRupeeIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                                    Wallet Ledger
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

            {totalPages > 1 && (

                <Stack spacing={2} alignItems="center" mt={2}>

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
