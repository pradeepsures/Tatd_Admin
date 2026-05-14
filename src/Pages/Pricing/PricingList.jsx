import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Menu, MenuItem
} from "@mui/material";
import TableCellBase, { tableCellClasses } from "@mui/material/TableCell";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Modal } from "antd";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { useAuth } from "../../auth/AuthContext";
import { getAllPricing, deletePricingApi } from "../../Services/PricingApi";
import xlsx from "json-as-xlsx";
import LoderBtn from "../../compoents/LoderBtn"; // your loader button

// ✅ TABLE HEADER STYLE
const StyledTableCell = styled(TableCellBase)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: theme.palette.common.white,
        fontWeight: 600,
    },
}));

export default function PricingList() {
    const { auth, hasPermission, loading: authLoading } = useAuth();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(7);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [filters, setFilters] = useState({
        bookingType: "",
        isActive: "",
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const navigate = useNavigate();

    // ✅ FETCH DATA
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const result = await getAllPricing({
                page,
                rowsPerPage,
                bookingType: filters.bookingType,
                isActive: filters.isActive,
            });

            if (result?.status) {
                setData(
                    result.data.map((item) => ({
                        ...item,
                        id: item._id,
                    }))
                );
                setTotalPages(result.totalPage || 0);
                setTotalRecord(result.totalResult || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filters]);

    // ✅ AUTO FETCH
    useEffect(() => {
        if (!authLoading.profile && auth.user) {
            fetchData();
        }
    }, [fetchData, authLoading.profile, auth.user]);

    // MENU
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
            title: "Delete Pricing",
            content: "Are you sure?",
            okType: "danger",
            onOk: async () => {
                const res = await deletePricingApi(id);
                if (res?.status) {
                    toast.success("Deleted successfully");
                    fetchData();
                }
            },
        });
    };

    const exportFunc = () => {
        if (data.length < 1) {
            return toast.error("No data!");
        }

        setIsExporting(true);

        const settings = {
            fileName: "Pricing_List",
            writeMode: "writeFile",
        };

        const excelData = [
            {
                sheet: "Pricing",
                columns: [
                    { label: "Region", value: (r) => r.region?.name || "-" },
                    { label: "Segment", value: (r) => r.segment?.name || "-" },
                    { label: "Booking Type", value: (r) => r.bookingType },
                    { label: "Base Fare", value: (r) => r.day?.baseFare },
                    { label: "Per Km", value: (r) => r.day?.perKmRate },
                    {
                        label: "Status",
                        value: (r) => (r.isActive ? "Active" : "Inactive"),
                    },
                ],
                content: data,
            },
        ];

        try {
            xlsx(excelData, settings);
            toast.success("Exported successfully!");
        } catch (err) {
            toast.error("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    if (authLoading.profile || loading) return <Loader />;
    if (!auth.user) return null;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Breaker />

            {/* FILTER */}
            <div className="flex justify-between mb-6 mt-4">
                <div className="flex gap-3">
                    <select
                        value={filters.bookingType}
                        onChange={(e) =>
                            setFilters((p) => ({ ...p, bookingType: e.target.value }))
                        }
                        className="border px-3 py-2 rounded"
                    >
                        <option value="">All Booking</option>
                        <option value="one_way">One Way</option>
                        <option value="round_trip">Round Trip</option>
                    </select>

                    <select
                        value={filters.isActive}
                        onChange={(e) =>
                            setFilters((p) => ({ ...p, isActive: e.target.value }))
                        }
                        className="border px-3 py-2 rounded"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {/* ✅ APPLY BUTTON FIXED */}
                    <button
                        onClick={() => setPage(1)}
                        className="bg-blue-600 text-white px-4 rounded"
                    >
                        Apply
                    </button>
                </div>

                <div className="flex gap-3">
                    {/* ✅ EXPORT BUTTON */}
                    <button
                        onClick={exportFunc}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg"
                    >
                        {isExporting ? <LoderBtn /> : "Export Excel"}
                    </button>

                    {/* ADD BUTTON */}
                    {hasPermission("Pricing", "create") && (
                        <button
                            onClick={() => navigate("create")}
                            className="bg-primary text-white px-5 py-2 rounded-lg"
                        >
                            Add Pricing
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
                            <StyledTableCell>REGION</StyledTableCell>
                            <StyledTableCell>SEGMENT</StyledTableCell>
                            <StyledTableCell>BOOKING TYPE</StyledTableCell>
                            <StyledTableCell>BASE FARE</StyledTableCell>
                            <StyledTableCell>STATUS</StyledTableCell>
                            <StyledTableCell align="center">ACTION</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data
                            .filter((row) => row.bookingType !== "hourly")
                            .map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                    <TableCell>{row.region?.name || "N/A"}</TableCell>
                                    <TableCell>{row.segment?.name || "N/A"}</TableCell>
                                    <TableCell>{row.bookingType}</TableCell>
                                    <TableCell>₹{row.day?.baseFare}</TableCell>
                                    <TableCell>
                                        {row.isActive ? "Active" : "Inactive"}
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                                            <MoreVertIcon />
                                        </IconButton>

                                        <Menu
                                            anchorEl={anchorEl}
                                            open={selectedRowId === row.id}
                                            onClose={handleMenuClose}
                                        >
                                            {hasPermission("Pricing", "read") && (
                                                <MenuItem onClick={() => navigate(`pricingview/${row.id}`)}>
                                                    <EyeIcon className="h-5 w-5 mr-2" /> View
                                                </MenuItem>
                                            )}

                                            {hasPermission("Pricing", "update") && (
                                                <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                                                    <PencilIcon className="h-5 w-5 mr-2" /> Edit
                                                </MenuItem>
                                            )}

                                            {hasPermission("Pricing", "delete") && (
                                                <MenuItem onClick={() => deleteHandler(row.id)}>
                                                    <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
                                                    Delete
                                                </MenuItem>
                                            )}
                                            {/* <MenuItem onClick={() => navigate(`pricingview/${row.id}`)}>
                                            <EyeIcon className="h-5 w-5 mr-2" /> View
                                        </MenuItem>
                                        <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                                            <PencilIcon className="h-5 w-5 mr-2" /> Edit
                                        </MenuItem>
                                        <MenuItem onClick={() => deleteHandler(row.id)}>
                                            <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
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
                <Stack mt={4} alignItems="center">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, val) => setPage(val)}
                    />
                </Stack>
            )}
        </div>
    );
}