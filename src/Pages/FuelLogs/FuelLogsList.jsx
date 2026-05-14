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
import { Select } from "antd";
const { Option } = Select;
import xlsx from "json-as-xlsx";
import LoderBtn from "../../compoents/LoderBtn";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import { getAllFuelLogs } from "../../Services/FuelLogsApi";
import { getAllDrivers } from "../../Services/DriverApi";
import { getAllVehicles } from "../../Services/VehicleApi";

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: "#fff",
        fontWeight: 600,
    },
}));

export default function FuelLogsList() {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const [filters, setFilters] = useState({
        driver: "",
        vehicle: "",
        carNumber: "",
        fuelType: "",
        startDate: "",
        endDate: "",
    });

    const [localFilters, setLocalFilters] = useState({ ...filters });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const [isExporting, setIsExporting] = useState(false);

    // ✅ FETCH DATA
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getAllFuelLogs({
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
            toast.error("Failed to fetch fuel logs");
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

    // ✅ RESET FILTER
    const handleReset = () => {
        const empty = {
            driver: "",
            vehicle: "",
            carNumber: "",
            fuelType: "",
            startDate: "",
            endDate: "",
        };
        setLocalFilters(empty);
        setFilters(empty);
        setPage(1);
    };

    useEffect(() => {
        const fetchDrivers = async () => {
            const res = await getAllDrivers({ page: 1, rowsPerPage: 100 });
            if (res?.status) setDrivers(res.data);
        };
        fetchDrivers();
    }, []);

    useEffect(() => {
        const fetchVehicles = async () => {
            const res = await getAllVehicles({ page: 1, limit: 100 });
            if (res?.status) setVehicles(res.data);
        };
        fetchVehicles();
    }, []);

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

    // DELETE (placeholder)
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Fuel Log",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                // TODO: call delete API
                toast.success("Delete API not added yet");
            },
        });
    };

    const exportExcel = () => {
        if (data.length < 1) return toast.error("No data");

        setIsExporting(true);

        const exportData = [
            {
                sheet: "Fuel Logs",
                columns: [
                    {
                        label: "Vehicle",
                        value: (r) =>
                            `${r?.vehicle?.brand || ""} (${r?.vehicle?.carNumber || ""})`,
                    },
                    {
                        label: "Chauffeur",
                        value: (r) => r?.driver?.name,
                    },
                    {
                        label: "Chauffeur Phone",
                        value: (r) => r?.driver?.phone,
                    },
                    {
                        label: "Fuel Type",
                        value: "fuelType",
                    },
                    {
                        label: "Fuel Quantity",
                        value: "fuelQuantity",
                    },
                    {
                        label: "Fuel Price",
                        value: "fuelPrice",
                    },
                    {
                        label: "Total Amount",
                        value: "fuelAmount",
                    },
                    {
                        label: "Odometer",
                        value: "odometerReading",
                    },
                    {
                        label: "Location",
                        value: "locationAddress",
                    },
                    {
                        label: "Date",
                        value: (r) =>
                            new Date(r.date).toLocaleString(),
                    },
                ],
                content: data,
            },
        ];

        xlsx(exportData, { fileName: "Fuel_Logs_List" });

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

                    {/* DRIVER DROPDOWN */}
                    <Select
                        showSearch
                        placeholder="Select chauffeur"
                        value={localFilters.driver || undefined}
                        onChange={(val) =>
                            setLocalFilters({ ...localFilters, driver: val })
                        }
                        optionFilterProp="children"
                        className="custom-select"
                    >
                        {drivers.map((d) => (
                            <Option key={d._id} value={d._id}>
                                {d.name} ({d.phone})
                            </Option>
                        ))}
                    </Select>

                    {/* VEHICLE DROPDOWN */}
                    <Select
                        showSearch
                        placeholder="Select Vehicle"
                        value={localFilters.vehicle || undefined}
                        onChange={(val) =>
                            setLocalFilters({ ...localFilters, vehicle: val })
                        }
                        optionFilterProp="children"
                        className="custom-select"
                    >
                        {vehicles.map((v) => (
                            <Option key={v._id} value={v._id}>
                                {v.brand} ({v.carNumber})
                            </Option>
                        ))}
                    </Select>

                    <input
                        type="text"
                        placeholder="Vehicle Number"
                        className="border p-2 rounded-2xl"
                        value={localFilters.carNumber}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, carNumber: e.target.value })
                        }
                    />

                    <select
                        className="border p-2 rounded-2xl"
                        value={localFilters.fuelType}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, fuelType: e.target.value })
                        }
                    >
                        <option value="">All Fuel Types</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                    </select>

                    <input
                        type={localFilters.startDate ? "date" : "text"}
                        placeholder="Start Date"
                        className="border p-2 rounded-2xl"
                        value={localFilters.startDate}
                        onFocus={(e) => {
                            e.target.type = "date";
                        }}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                e.target.type = "text";
                            }
                        }}
                        onChange={(e) =>
                            setLocalFilters({
                                ...localFilters,
                                startDate: e.target.value,
                            })
                        }
                    />

                    <input
                        type={localFilters.endDate ? "date" : "text"}
                        placeholder="End Date"
                        className="border p-2 rounded-2xl"
                        value={localFilters.endDate}
                        onFocus={(e) => {
                            e.target.type = "date";
                        }}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                e.target.type = "text";
                            }
                        }}
                        onChange={(e) =>
                            setLocalFilters({
                                ...localFilters,
                                endDate: e.target.value,
                            })
                        }
                    />
                 
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

            {/* ACTION */}
            <div className="flex justify-end gap-4 mb-6">

                <motion.button
                    onClick={exportExcel}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                    {isExporting ? <LoderBtn /> : "Export Excel"}
                </motion.button>

                {/* <motion.button
                    onClick={() => navigate("/home/fuelLogs/create")}
                    className="bg-primary text-white px-5 py-2 rounded-lg"
                >
                    Add Fuel Log
                </motion.button> */}

            </div>

            {/* TABLE */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.No</StyledTableCell>
                            <StyledTableCell>VEHICLE</StyledTableCell>
                            <StyledTableCell>CHAUFFEUR</StyledTableCell>
                            <StyledTableCell>FUEL TYPE</StyledTableCell>
                            <StyledTableCell>QTY</StyledTableCell>
                            <StyledTableCell>AMOUNT</StyledTableCell>
                            <StyledTableCell>DATE</StyledTableCell>
                            <StyledTableCell align="center">ACTIONS</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {(page - 1) * rowsPerPage + index + 1}
                                </TableCell>

                                <TableCell>
                                    {row?.vehicle?.brand || row?.vehicle?.carNumber
                                        ? `${row?.vehicle?.brand || ""} ${row?.vehicle?.carNumber || ""}`
                                        : "N/A"}
                                </TableCell>

                                {/* <TableCell>
                                    {row?.vehicle?.brand || {row?.vehicle?.carNumber} } ()
                                </TableCell> */}

                                <TableCell>
                                    {row?.driver?.name || "N/A"}
                                </TableCell>

                                <TableCell>{row.fuelType || "N/A"}</TableCell>

                                <TableCell>{row.fuelQuantity || "N/A"}</TableCell>

                                <TableCell>₹ {row.fuelAmount || "N/A"}</TableCell>

                                <TableCell>
                                    {new Date(row.date).toLocaleString() || "N/A"}
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
                                        <MenuItem onClick={() => navigate(`view/${row.id}`)}>
                                            <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                            View
                                        </MenuItem>

                                        {/* <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                                            <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                            Edit
                                        </MenuItem> */}

                                        {/* <MenuItem onClick={() => deleteHandler(row.id)}>
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