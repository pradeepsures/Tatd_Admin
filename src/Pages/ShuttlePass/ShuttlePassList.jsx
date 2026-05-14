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
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { motion } from "framer-motion";
import { Button, Modal } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import {
    getAllShuttlePasses,
    deleteShuttlePassApi,
    toggleShuttlePassStatusApi,
} from "../../Services/ShuttlePassApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: "#fff",
        fontWeight: 600,
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
}));

export default function ShuttlePassList() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isActive, setIsActive] = useState("");

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const [isExporting, setIsExporting] = useState(false);

    // ✅ FETCH DATA
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getAllShuttlePasses({
                page,
                rowsPerPage,
                search: searchQuery,
                isActive,
            });

            if (res?.status) {
                setData(res.data.map((i) => ({ ...i, id: i._id })));
                setTotalPages(res.totalPage || 0);
            }
        } catch {
            toast.error("Failed to fetch passes");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery, isActive]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ DELETE
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Shuttle Pass",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                const res = await deleteShuttlePassApi(id);
                if (res?.status) {
                    toast.success("Deleted successfully");
                    fetchData();
                }
            },
        });
    };

    // ✅ TOGGLE STATUS
    const toggleStatus = async (id) => {
        try {
            const res = await toggleShuttlePassStatusApi(id);
            if (res?.status) {
                toast.success("Status updated");
                fetchData();
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    // ✅ EXPORT
    const exportExcel = () => {
        if (!data.length) return toast.error("No data");

        setIsExporting(true);

        const excelData = [
            {
                sheet: "Shuttle Passes",
                columns: [
                    { label: "Name", value: "name" },
                    { label: "Short Desc", value: "shortDescription" },
                    { label: "Ride Count", value: "rideCount" },
                    { label: "Validity Days", value: "validityDays" },
                    {
                        label: "Status",
                        value: (row) => (row.isActive ? "Active" : "Inactive"),
                    },
                ],
                content: data,
            },
        ];

        xlsx(excelData);
        setIsExporting(false);
    };

    // MENU
    const handleMenuOpen = (e, id) => {
        setAnchorEl(e.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Breaker />

            {/* TOP BAR */}
            <div className="flex justify-between mb-6">
                <div className="flex gap-3">
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    />

                    <select
                        value={isActive}
                        onChange={(e) => setIsActive(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearchQuery(search);
                            setPage(1);
                        }}
                        className="bg-blue-600 text-white px-4 rounded-lg"
                    >
                        Search
                    </button>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        onClick={exportExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </motion.button>
                    {hasPermission("ShuttlePass", "read") && (
                        <button
                            onClick={() => navigate("create")}
                            className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                            + Add Pass
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.No</StyledTableCell>
                            <StyledTableCell>IMAGE</StyledTableCell>
                            <StyledTableCell>NAME</StyledTableCell>
                            <StyledTableCell>RIDE</StyledTableCell>
                            <StyledTableCell>VALIDITY</StyledTableCell>
                            <StyledTableCell>STATUS</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, i) => (
                            <StyledTableRow key={row.id}>
                                <StyledTableCell>
                                    {(page - 1) * rowsPerPage + i + 1}
                                </StyledTableCell>

                                <StyledTableCell>
                                    <img
                                        src={row.thumbImage}
                                        className="h-12 w-16 object-cover rounded"
                                    />
                                </StyledTableCell>

                                <StyledTableCell>{row.name}</StyledTableCell>
                                <StyledTableCell>{row.rideCount}</StyledTableCell>
                                <StyledTableCell>{row.validityDays} Days</StyledTableCell>

                                <StyledTableCell>
                                    <div className="flex items-center gap-3">
                                        {/* STATUS BADGE */}
                                        <span
                                            className={`px-2 py-1 rounded text-white text-xs ${row.isActive ? "bg-green-600" : "bg-red-500"
                                                }`}
                                        >
                                            {row.isActive ? "Active" : "Inactive"}
                                        </span>

                                        {/* TOGGLE SWITCH */}
                                        <button
                                            onClick={() => toggleStatus(row.id)}
                                            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${row.isActive ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${row.isActive ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </StyledTableCell>

                                <StyledTableCell align="center">
                                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                                        <MoreVertIcon />
                                    </IconButton>

                                    {/* <Menu
                                        anchorEl={anchorEl}
                                        open={selectedId === row.id}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem
                                            onClick={() => navigate(`view/${row.id}`)}
                                        >
                                            <EyeIcon className="h-4 mr-2" /> View
                                        </MenuItem>

                                        <MenuItem
                                            onClick={() => navigate(`update/${row.id}`)}
                                        >
                                            <PencilIcon className="h-4 mr-2" /> Edit
                                        </MenuItem>

                                        <MenuItem
                                            onClick={() => deleteHandler(row.id)}
                                        >
                                            <TrashIcon className="h-4 mr-2" /> Delete
                                        </MenuItem>
                                    </Menu> */}
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && selectedRowId === row._id}
                                        onClose={handleMenuClose}
                                    >
                                        {hasPermission("ShuttlePass", "read") && (
                                            <MenuItem onClick={() => navigate(`view/${row._id}`)}>
                                                <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                View
                                            </MenuItem>
                                        )}

                                        {hasPermission("ShuttlePass", "update") && (
                                            <MenuItem onClick={() => navigate(`update/${row._id}`)}>
                                                <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                Edit
                                            </MenuItem>
                                        )}

                                        {hasPermission("ShuttlePass", "delete") && (
                                            <MenuItem onClick={() => deleteHandler(row._id)}>
                                                <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                Delete
                                            </MenuItem>
                                        )}
                                    </Menu>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Stack alignItems="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                />
            </Stack>
        </div>
    );
}