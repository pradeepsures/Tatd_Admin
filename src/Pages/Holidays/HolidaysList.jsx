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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import { getAllRegions } from "../../Services/RegionApi";
import { useAuth } from "../../auth/AuthContext";
import { Select } from "antd";
import { Switch } from "antd";


const { Option } = Select;
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

import {
    getAllHolidays,
    deleteHolidayApi,
    toggleHolidayStatusApi
} from "../../Services/HolidaysApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.95rem",
    },
}));

const formatDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
};

export default function HolidayList() {
    const { hasPermission, authLoading, auth } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [regions, setRegions] = useState([]);
    const [regionLoading, setRegionLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const [toggleLoading, setToggleLoading] = useState(null);

    // ✅ FILTER STATE (MAIN)
    const [filters, setFilters] = useState({
        search: "",
        region: "",
        startDate: "",
        endDate: "",
        startDateFormatted: "",
        endDateFormatted: "",
        isActive: "",
    });

    // ✅ TEMP UI STATE (LIKE BOOKING FILTER)
    const [localFilters, setLocalFilters] = useState({ ...filters });

    const [isExporting, setIsExporting] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const navigate = useNavigate();

    const fetchRegions = async () => {
        try {
            setRegionLoading(true);

            const res = await getAllRegions({
                page: 1,
                rowsPerPage: 100,
            });

            if (res?.status) {
                setRegions(res.data || []);
            }
        } catch {
            toast.error("Failed to load regions");
        } finally {
            setRegionLoading(false);
        }
    };

    // ✅ FETCH
    const fetchHolidays = useCallback(async () => {
        try {
            setLoading(true);

            const result = await getAllHolidays({
                page,
                rowsPerPage,
                ...filters,
            });

            if (result?.status) {
                const formatted = result.data.map((item) => ({
                    ...item,
                    id: item._id,
                }));

                setData(formatted);
                setTotalPages(result.totalPage);
                setTotalRecord(result.totalResult);
            }
        } catch {
            toast.error("Error fetching holidays");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filters]);

    useEffect(() => {
        fetchHolidays();
        fetchRegions();
    }, [fetchHolidays]);

    // ✅ APPLY FILTER
    const handleApply = () => {
        setFilters({
            ...localFilters,
            startDate: localFilters.startDateFormatted || "",
            endDate: localFilters.endDateFormatted || "",
        });
        setPage(1);
    };
    // const handleApply = () => {
    //     setFilters(localFilters);
    //     setPage(1);
    // };

    // ✅ RESET FILTER
    const handleReset = () => {
        const empty = {
            search: "",
            region: "",
            startDate: "",
            endDate: "",
            startDateFormatted: "",
            endDateFormatted: "",
            isActive: "",
        };

        setLocalFilters(empty);
        setFilters(empty);
        setPage(1);
    };

    // MENU
    const handleMenuOpen = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedRowId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRowId(null);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    // DELETE
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Holiday",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                const result = await deleteHolidayApi(id);
                if (result?.status) {
                    toast.success("Deleted");
                    fetchHolidays();
                }
            },
        });
    };

    const handleToggleStatus = async (id) => {
        try {
            setToggleLoading(id);

            const res = await toggleHolidayStatusApi(id);

            if (res?.status) {
                toast.success("Status updated");
                fetchHolidays();
            }
        } catch (err) {
            console.log(err);
        } finally {
            setToggleLoading(null);
        }
    };

    // EXPORT
    const exportExcel = () => {
        if (data.length < 1) return toast.error("Empty");

        setIsExporting(true);

        const exportData = [
            {
                sheet: "Holidays",
                columns: [
                    { label: "Name", value: "name" },
                    { label: "Date", value: (r) => new Date(r.date).toLocaleDateString() },
                    { label: "Region", value: (r) => r?.region?.name },
                    { label: "State", value: (r) => r?.region?.state },
                    { label: "Status", value: (r) => (r.isActive ? "Active" : "Inactive") },
                ],
                content: data,
            },
        ];

        xlsx(exportData, { fileName: "Holiday_List" });
        setIsExporting(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            <Breaker />

            {/* ✅ FILTER UI */}
            <div className="bg-white p-5 rounded-xl shadow mb-6">

                <h3 className="text-lg font-semibold mb-4">Search & Filters</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input
                        type="text"
                        placeholder="Search holiday name"
                        className="border p-2 rounded-2xl"
                        value={localFilters.search}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, search: e.target.value })
                        }
                    />

                    {/* START DATE */}
                    <input
                        type={localFilters.startDate ? "date" : "text"}
                        placeholder="Start Date"
                        className="border p-2 rounded-2xl"
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
                        className="border p-2 rounded-2xl"
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
                        className="border p-2 rounded-2xl"
                        value={localFilters.startDate}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, startDate: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        className="border p-2 rounded-2xl"
                        value={localFilters.endDate}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, endDate: e.target.value })
                        }
                    /> */}

                    <Select
                        showSearch
                        size="large"
                        placeholder="Select Region"
                        value={localFilters.region || undefined}
                        onChange={(val) =>
                            setLocalFilters({ ...localFilters, region: val })
                        }
                        loading={regionLoading}
                        optionFilterProp="children"
                        className="custom-select"
                    >
                        {regions.map((r) => (
                            <Option key={r._id} value={r._id}>
                                {r.name} ({r.state})
                            </Option>
                        ))}
                    </Select>

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

                {/* BUTTONS */}
                <div className="flex gap-3 mt-5">

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApply}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        Apply Filters
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className="bg-gray-400 text-white px-5 py-2 rounded-lg"
                    >
                        Reset
                    </motion.button>

                </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-4 mb-6">

                <motion.button
                    onClick={exportExcel}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                    {isExporting ? <LoderBtn /> : "Export Excel"}
                </motion.button>

                {/* <motion.button
                    onClick={() => navigate("/home/holidays/create")}
                    className="bg-primary text-white px-5 py-2 rounded-lg"
                >
                    Add Holiday
                </motion.button> */}
                {hasPermission("Holidays", "create") && (
                    <motion.button
                        onClick={() => navigate("/home/holidays/create")}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        Add Holiday
                    </motion.button>
                )}

            </div>

            {/* TABLE SAME */}
            <TableContainer component={Paper} className="rounded-xl shadow">
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.No</StyledTableCell>
                            <StyledTableCell>NAME</StyledTableCell>
                            <StyledTableCell>DATE</StyledTableCell>
                            <StyledTableCell>REGION</StyledTableCell>
                            <StyledTableCell>STATE</StyledTableCell>
                            <StyledTableCell>STATUS</StyledTableCell>
                            <StyledTableCell>CREATED AT</StyledTableCell>
                            <StyledTableCell align="center">ACTIONS</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id}>
                                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                <TableCell>{row?.region?.name}</TableCell>
                                <TableCell>{row?.region?.state}</TableCell>
                                {/* <TableCell>{row.isActive ? "Active" : "Inactive"}</TableCell> */}
                                <TableCell>
                                    <div className="flex items-center gap-2">

                                        {/* SWITCH */}
                                        <Switch
                                            checked={row.isActive}
                                            loading={toggleLoading === row.id}
                                            onChange={() => handleToggleStatus(row.id)}
                                        />

                                        {/* STATUS TEXT */}
                                        <span
                                            className={`text-sm font-semibold ${row.isActive ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {row.isActive ? "Active" : "Inactive"}
                                        </span>

                                    </div>
                                </TableCell>
                                <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>

                                <TableCell align="center">
                                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                                        <MoreVertIcon />
                                    </IconButton>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && selectedRowId === row.id}
                                        onClose={handleMenuClose}
                                    >
                                        {/* <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                                            <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                            Edit
                                        </MenuItem> */}
                                        {hasPermission("Holidays", "edit") && (
                                            <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                                                <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                Edit
                                            </MenuItem>
                                        )}
                                        {hasPermission("Holidays", "delete") && (
                                            <MenuItem onClick={() => deleteHandler(row.id)}>
                                                <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                Delete
                                            </MenuItem>
                                        )}

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