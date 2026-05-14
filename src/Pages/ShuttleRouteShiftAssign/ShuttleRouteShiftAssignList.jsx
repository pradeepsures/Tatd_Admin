import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
    Table, TableBody, TableCell, tableCellClasses,
    TableContainer, TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal, Select } from "antd";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";

import {
    getAllShuttleRouteShiftAssigns,
    deleteShuttleRouteShiftAssignApi
} from "../../Services/ShuttleRouteShiftAssignApi";

import { getAllShuttleRoutes } from "../../Services/ShuttleRouteApi";
import { getAllShuttleRouteShifts } from "../../Services/SuttleRouteShiftApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";

const { Option } = Select;

// ✅ HEADER STYLE
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

export default function ShuttleRouteShiftAssignList() {

    const navigate = useNavigate();
const { hasPermission } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [routes, setRoutes] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [filters, setFilters] = useState({
        shuttleRoute: "",
        shuttleRouteShift: "",
        driver: "",
        vehicle: "",
        startDate: "",
        endDate: "",
        startDateFormatted: "",
        endDateFormatted: ""
    });

    const [localFilters, setLocalFilters] = useState({
        shuttleRoute: undefined,
        shuttleRouteShift: undefined,
        driver: undefined,
        vehicle: undefined,
        startDate: "",
        endDate: "",
        startDateFormatted: "",
        endDateFormatted: ""
    });

    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const [isExporting, setIsExporting] = useState(false);

    // ✅ FETCH DROPDOWNS
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [r, s, d, v] = await Promise.all([
                    getAllShuttleRoutes({ page: 1, rowsPerPage: 100 }),
                    getAllShuttleRouteShifts({ page: 1, rowsPerPage: 100 }),
                    getAllDrivers({ page: 1, rowsPerPage: 100 }),
                    getAllVehicles({ page: 1, limit: 100 })
                ]);

                setRoutes(r?.data || []);
                setShifts(s?.data || []);
                setDrivers(d?.data || []);
                setVehicles(v?.data || []);

            } catch {
                toast.error("Dropdown load failed");
            }
        };

        fetchAll();
    }, []);

    // ✅ FETCH LIST
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getAllShuttleRouteShiftAssigns({
                page,
                rowsPerPage,
                ...filters
            });

            if (res?.status) {
                setData(res.data);
                setTotalPages(res.totalPage);
                setTotalRecord(res.totalResult);
            }

        } catch {
            toast.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ APPLY FILTER
    const handleApply = () => {
        setFilters({
            shuttleRoute: localFilters.shuttleRoute || "",
            shuttleRouteShift: localFilters.shuttleRouteShift || "",
            driver: localFilters.driver || "",
            vehicle: localFilters.vehicle || "",
            startDate: localFilters.startDateFormatted || "",
            endDate: localFilters.endDateFormatted || ""
        });
        setPage(1);
    };

    // ✅ RESET
    const handleReset = () => {
        setLocalFilters({
            shuttleRoute: undefined,
            shuttleRouteShift: undefined,
            driver: undefined,
            vehicle: undefined,
            startDate: "",
            endDate: "",
            startDateFormatted: "",
            endDateFormatted: ""
        });

        setFilters({
            shuttleRoute: "",
            shuttleRouteShift: "",
            driver: "",
            vehicle: "",
            startDate: "",
            endDate: "",
            startDateFormatted: "",
            endDateFormatted: ""
        });

        setPage(1);
    };

    // ✅ DELETE
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Assignment",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                const res = await deleteShuttleRouteShiftAssignApi(id);
                if (res?.status) {
                    toast.success("Deleted");
                    fetchData();
                }
            }
        });
    };

    // ✅ EXPORT
    const exportExcel = () => {
        if (!data.length) return toast.error("No data");

        setIsExporting(true);

        const exportData = [
            {
                sheet: "Assignments",
                columns: [
                    { label: "Route", value: (r) => r?.shuttleRoute?.name },
                    { label: "Shift", value: (r) => r?.shuttleRouteShift?.shiftName },
                    { label: "Driver", value: (r) => r?.driver?.name },
                    { label: "Vehicle", value: (r) => `${r?.vehicle?.brand} - ${r?.vehicle?.carNumber}` },
                    { label: "Date", value: (r) => new Date(r.date).toLocaleDateString() },
                ],
                content: data,
            },
        ];

        xlsx(exportData, { fileName: "Shuttle_Assignments" });
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

                    <Select
                        showSearch
                        className="custom-select"
                        placeholder="Route"
                        value={localFilters.shuttleRoute}
                        onChange={(v) => setLocalFilters({ ...localFilters, shuttleRoute: v })}
                    >
                        {routes.map((r) => (
                            <Option key={r._id} value={r._id}>
                                {r.name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        showSearch
                        className="custom-select"
                        placeholder="Shift"
                        value={localFilters.shuttleRouteShift}
                        onChange={(v) =>
                            setLocalFilters({ ...localFilters, shuttleRouteShift: v })
                        }
                    >
                        {shifts.map((s) => (
                            <Option key={s._id} value={s._id}>
                                {s.shiftName}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        showSearch
                        className="custom-select"
                        placeholder="Driver"
                        value={localFilters.driver}
                        onChange={(v) => setLocalFilters({ ...localFilters, driver: v })}
                    >
                        {drivers.map((d) => (
                            <Option key={d._id} value={d._id}>
                                {d.name || d.phone || "Unnamed Driver"}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        showSearch
                        className="custom-select"
                        placeholder="Vehicle"
                        value={localFilters.vehicle}
                        onChange={(v) => setLocalFilters({ ...localFilters, vehicle: v })}
                    >
                        {vehicles.map((v) => (
                            <Option key={v._id} value={v._id}>
                                {v.brand} - {v.carNumber}
                            </Option>
                        ))}
                    </Select>
                    {/* START DATE */}
                    <input
                        type={localFilters.startDate ? "date" : "text"}
                        placeholder="Start Date"
                        className="border p-2 rounded-xl"
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
                        className="border p-2 rounded-xl"
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
                        className="border p-2 rounded-xl"
                        value={localFilters.startDate}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, startDate: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        className="border p-2 rounded-xl"
                        value={localFilters.endDate}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, endDate: e.target.value })
                        }
                    /> */}
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

                {/* <motion.button
                    onClick={() => navigate("/home/shuttleRouteShiftAssign/create")}
                    className="bg-primary text-white px-5 py-2 rounded-lg"
                >
                    Add Assignment
                </motion.button> */}
                {hasPermission("ShuttleRouteShiftAssign", "create") && (
                    <motion.button
                        onClick={() => navigate("/home/shuttleRoutes/create")}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        Add Assignment
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
                            <StyledTableCell>SHIFT</StyledTableCell>
                            <StyledTableCell>DRIVER</StyledTableCell>
                            <StyledTableCell>VEHICLE</StyledTableCell>
                            <StyledTableCell>DATE</StyledTableCell>
                            <StyledTableCell align="center">ACTIONS</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row._id}>
                                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                <TableCell>{row?.shuttleRoute?.name}</TableCell>
                                <TableCell>{row?.shuttleRouteShift?.shiftName}</TableCell>
                                <TableCell>{row?.driver?.name}</TableCell>
                                <TableCell>{row?.vehicle?.brand} - {row?.vehicle?.carNumber}</TableCell>
                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>

                                <TableCell align="center">
                                    <IconButton onClick={(e) => {
                                        setAnchorEl(e.currentTarget);
                                        setSelectedRowId(row._id);
                                    }}>
                                        <MoreVertIcon />
                                    </IconButton>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={selectedRowId === row._id}
                                        onClose={() => setAnchorEl(null)}
                                    >
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && selectedRowId === row._id}
                                            onClose={handleMenuClose}
                                        >
                                            {hasPermission("ShuttleRouteShiftAssign", "read") && (
                                                <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                                                    <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                    View
                                                </MenuItem>
                                            )}

                                            {hasPermission("ShuttleRouteShiftAssign", "update") && (
                                                <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                                                    <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                    Edit
                                                </MenuItem>
                                            )}

                                            {hasPermission("ShuttleRouteShiftAssign", "delete") && (
                                                <MenuItem onClick={() => deleteHandler(row._id)}>
                                                    <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                    Delete
                                                </MenuItem>
                                            )}
                                        </Menu>
                                        {/* <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                                            <EyeIcon className="h-5 w-5 mr-2 text-blue-600" /> View
                                        </MenuItem>

                                        <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                                            <PencilIcon className="h-5 w-5 mr-2 text-green-600" /> Edit
                                        </MenuItem>

                                        <MenuItem onClick={() => deleteHandler(row._id)}>
                                            <TrashIcon className="h-5 w-5 mr-2 text-red-600" /> Delete
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
                    <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
                </Stack>
            )}
        </div>
    );
}