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
import { motion } from "framer-motion";
import { Modal, Select } from "antd";
import { useAuth } from "../../auth/AuthContext";
import xlsx from "json-as-xlsx";
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlusCircleIcon,
    LinkSlashIcon,
} from "@heroicons/react/24/outline";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";
import LoderBtn from "../../compoents/LoderBtn";

import {
    getAllPunchRegions,
    deletePunchRegionApi,
    assignPunchRegionApi,
    removePunchRegionApi,
} from "../../Services/PunchRegionApi";

import { getAllRegions } from "../../Services/RegionApi";
import { getAllDrivers } from "../../Services/DriverApi";

const { Option } = Select;

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: "#fff",
        fontWeight: 600,
    },
}));

export default function PunchRegionList() {
    const navigate = useNavigate();
    const { hasPermission, authLoading, auth } = useAuth();
    const [data, setData] = useState([]);
    const [regions, setRegions] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const [filters, setFilters] = useState({
        search: "",
        isActive: "",
        region: "",
    });

    const [localFilters, setLocalFilters] = useState({ ...filters });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    // ✅ MODAL STATE
    const [assignModal, setAssignModal] = useState(false);
    const [removeModal, setRemoveModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedPunchRegion, setSelectedPunchRegion] = useState(null);

    // FETCH DRIVERS
    const fetchDrivers = async (search = "") => {
        try {
            const res = await getAllDrivers({
                page: 1,
                rowsPerPage: 100,
                searchQuery: search,
            });
            if (res?.status) setDrivers(res.data || []);
        } catch {
            toast.error("Failed to load drivers");
        }
    };

    const fetchRegions = async () => {
        try {
            const res = await getAllRegions({ page: 1, rowsPerPage: 100 });
            if (res?.status) setRegions(res.data || []);
        } catch {
            toast.error("Failed to load regions");
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllPunchRegions({
                page,
                rowsPerPage,
                ...filters,
            });

            if (res?.status) {
                setData(res.data || []);
                setTotalPages(res.totalPage);
                setTotalRecord(res.totalResult);
            }
        } catch {
            toast.error("Failed to fetch punch regions");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filters]);

    useEffect(() => {
        fetchData();
        fetchRegions();
        fetchDrivers();
    }, [fetchData]);

    const handleMenuOpen = (e, id) => {
        setAnchorEl(e.currentTarget);
        setSelectedRowId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRowId(null);
    };

    // DELETE
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Punch Region",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                const res = await deletePunchRegionApi(id);
                if (res?.status) {
                    toast.success("Deleted");
                    fetchData();
                }
            },
        });
    };

    // ✅ ASSIGN
    const handleAssign = async () => {
        if (!selectedDriver) return toast.error("Select driver");

        const res = await assignPunchRegionApi({
            driverId: selectedDriver,
            punchRegionId: selectedPunchRegion,
        });

        if (res?.status) {
            toast.success("Assigned successfully");
            setAssignModal(false);
            setSelectedDriver(null);
        }
    };

    // ✅ REMOVE
    const handleRemove = async () => {
        if (!selectedDriver) return toast.error("Select driver");

        const res = await removePunchRegionApi(selectedDriver);

        if (res?.status) {
            toast.success("Removed successfully");
            setRemoveModal(false);
            setSelectedDriver(null);
        }
    };

    // EXPORT
    const exportExcel = () => {
        if (!data.length) return toast.error("No data");

        setIsExporting(true);

        const exportData = [
            {
                sheet: "Punch Regions",
                columns: [
                    { label: "Name", value: "name" },
                    { label: "Region", value: (r) => r.region?.name },
                    { label: "Radius", value: "radiusMeters" },
                    { label: "Address", value: "address" },
                    {
                        label: "Status",
                        value: (r) => (r.isActive ? "Active" : "Inactive"),
                    },
                ],
                content: data,
            },
        ];

        xlsx(exportData, { fileName: "Punch_Regions" });
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

                    {/* SEARCH */}
                    <input
                        type="text"
                        placeholder="Search name"
                        className="border p-2 rounded-lg"
                        value={localFilters.search}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, search: e.target.value })
                        }
                    />

                    {/* STATUS */}
                    <select
                        className="border p-2 rounded-lg"
                        value={localFilters.isActive}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, isActive: e.target.value })
                        }
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {/* REGION DROPDOWN */}
                    <select
                        className="border p-2 rounded-lg"
                        value={localFilters.region}
                        onChange={(e) =>
                            setLocalFilters({ ...localFilters, region: e.target.value })
                        }
                    >
                        <option value="">All Regions</option>
                        {regions.map((r) => (
                            <option key={r._id} value={r._id}>
                                {r.name}
                            </option>
                        ))}
                    </select>

                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-5">

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setFilters(localFilters);
                            setPage(1);
                        }}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        Apply Filters
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const empty = { search: "", isActive: "", region: "" };
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

                {hasPermission("PunchRegion", "create") && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("create")}
                        className="bg-primary text-white px-5 py-2 rounded-lg"
                    >
                        Create
                    </motion.button>
                )}

                {/* <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("create")}
                    className="bg-primary text-white px-5 py-2 rounded-lg"
                >
                    Add Punch Region
                </motion.button> */}
            </div>

            {/* TABLE */}
            <TableContainer component={Paper} className="rounded-xl shadow">
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.No</StyledTableCell>
                            <StyledTableCell>NAME</StyledTableCell>
                            <StyledTableCell>REGION</StyledTableCell>
                            <StyledTableCell>ADDRESS</StyledTableCell>
                            <StyledTableCell>RADIUS</StyledTableCell>
                            <StyledTableCell>STATUS</StyledTableCell>
                            <StyledTableCell align="center">ACTIONS</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.region?.name}</TableCell>
                                <TableCell>{row.address}</TableCell>
                                <TableCell>{row.radiusMeters} m</TableCell>
                                <TableCell>{row.isActive ? "Active" : "Inactive"}</TableCell>

                                <TableCell align="center">
                                    <IconButton onClick={(e) => handleMenuOpen(e, row._id)}>
                                        <MoreVertIcon />
                                    </IconButton>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && selectedRowId === row._id}
                                        onClose={handleMenuClose}
                                    >
                                        {hasPermission("PunchRegion", "read") && (
                                            <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                                                <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
                                                View
                                            </MenuItem>
                                        )}

                                        {hasPermission("PunchRegion", "update") && (
                                            <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                                                <PencilIcon className="h-5 w-5 mr-2 text-green-600" />
                                                Edit
                                            </MenuItem>
                                        )}

                                        {hasPermission("PunchRegion", "delete") && (
                                            <MenuItem onClick={() => deleteHandler(row._id)}>
                                                <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
                                                Delete
                                            </MenuItem>
                                        )}

                                        {/* ASSIGN */}
                                        <MenuItem
                                            onClick={() => {
                                                setAssignModal(true);
                                                setSelectedPunchRegion(row._id);
                                                handleMenuClose();
                                            }}
                                        >
                                            <PlusCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                                            Assign
                                        </MenuItem>

                                        {/* REMOVE */}
                                        <MenuItem
                                            onClick={() => {
                                                setRemoveModal(true);
                                                handleMenuClose();
                                            }}
                                        >
                                            <LinkSlashIcon className="h-5 w-5 mr-2 text-red-600" />
                                            Remove
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ✅ ASSIGN MODAL */}
            <Modal
                title="Assign Driver"
                open={assignModal}
                onCancel={() => setAssignModal(false)}
                onOk={handleAssign}
            >
                <Select
                    showSearch
                    placeholder="Select Driver"
                    className="w-full"
                    onSearch={(val) => fetchDrivers(val)}
                    onChange={(val) => setSelectedDriver(val)}
                    filterOption={false}
                >
                    {drivers.map((d) => (
                        <Option key={d._id} value={d._id}>
                            {d.name} ({d.phone})
                        </Option>
                    ))}
                </Select>
            </Modal>

            {/* ✅ REMOVE MODAL */}
            <Modal
                title="Remove Punch Region"
                open={removeModal}
                onCancel={() => setRemoveModal(false)}
                onOk={handleRemove}
            >
                <Select
                    showSearch
                    placeholder="Select Driver"
                    className="w-full"
                    onSearch={(val) => fetchDrivers(val)}
                    onChange={(val) => setSelectedDriver(val)}
                    filterOption={false}
                >
                    {drivers.map((d) => (
                        <Option key={d._id} value={d._id}>
                            {d.name}
                        </Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
}