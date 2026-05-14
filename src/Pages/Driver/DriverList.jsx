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
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

import { getAllDrivers, deleteDriver } from "../../Services/DriverApi";
import { useAuth } from "../../auth/AuthContext";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.95rem",
    },
}));

export default function DriverList() {
    const { hasPermission } = useAuth();
    const SECTION = "Driver";
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(7);

    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    const fetchDrivers = useCallback(async () => {

        try {

            setLoading(true);

            const result = await getAllDrivers({
                page,
                rowsPerPage,
                searchQuery
            });

            if (result?.status) {

                const formatted = result.data.map((item) => ({
                    ...item,
                    id: item._id
                }));

                setData(formatted);
                setTotalPages(result.totalPage);
                setTotalRecord(result.totalResult);
                setStats(result.stats || null);

            }

        } catch (err) {

            toast.error("Error fetching drivers");

        } finally {

            setLoading(false);

        }

    }, [page, rowsPerPage, searchQuery]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

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

    const deleteHandler = (id) => {

        Modal.confirm({
            title: "Delete Chauffeur",
            content: "Are you sure you want to delete this Chauffeur?",
            okType: "danger",

            onOk: async () => {

                try {

                    const result = await deleteDriver(id);

                    if (result?.status) {

                        toast.success("Chauffeur deleted");
                        fetchDrivers();

                    }

                } catch (err) {

                    toast.error("Error deleting Chauffeur");

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

    if (loading) return <Loader />;

    return (

        <div className="p-6 bg-gray-50 min-h-screen">

            <div className="flex justify-between items-center mb-4">

                {/* LEFT */}
                <Breaker />

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
                        {isLoading ? <LoderBtn /> : "Add Chauffeur"}
                    </motion.button> */}

                    {hasPermission(SECTION, "create") && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddDriver}
                            className="bg-primary text-white px-5 py-2 rounded-lg"
                        >
                            {isLoading ? <LoderBtn /> : "Add Chauffeur"}
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

                            <StyledTableCell>TRIP</StyledTableCell>

                            <StyledTableCell>REGION</StyledTableCell>

                            <StyledTableCell>ADDRESS</StyledTableCell>

                            <StyledTableCell>VERIFIED</StyledTableCell>

                            <StyledTableCell align="center">Actions</StyledTableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {data.length === 0 ? (

                            <TableRow>
                                <TableCell colSpan={6} align="center">
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

                                    {/* Trip */}
                                    <TableCell>

                                        <MenuItem
                                            onClick={() => {
                                                navigate(`driverBookingView/${row.id}`);
                                            }}
                                        >
                                            <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />

                                        </MenuItem>

                                    </TableCell>


                                    {/* REGION ADDRESS */}
                                    <TableCell>

                                        <span className="text-gray-700">
                                            {row?.region?.name || "N/A"}
                                        </span>

                                    </TableCell>

                                    <TableCell>

                                        <span className="text-gray-700">
                                            {row?.permanentAddress || "N/A"}
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
                                            onClick={(e) => handleMenuOpen(e, row.id)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>

                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && selectedRowId === row.id}
                                            onClose={handleMenuClose}
                                        >

                                            {/* <MenuItem
                                                onClick={() => {
                                                    navigate(`driverView/${row.id}`);
                                                }}
                                            >
                                                <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                View
                                            </MenuItem> */}
                                            {hasPermission(SECTION, "read") && (
                                                <MenuItem onClick={() => navigate(`driverView/${row.id}`)}>
                                                    <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                    View
                                                </MenuItem>
                                            )}

                                            {/* <MenuItem
                                                onClick={() => {
                                                    navigate(`updateDriver/${row.id}`);
                                                }}
                                            >
                                                <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                Edit
                                            </MenuItem> */}
                                            {hasPermission(SECTION, "update") && (
                                                <MenuItem onClick={() => navigate(`updateDriver/${row.id}`)}>
                                                    <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                                                    Edit
                                                </MenuItem>
                                            )}

                                            {/* <MenuItem onClick={() => deleteHandler(row.id)}>
                                                <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                Delete
                                            </MenuItem> */}
                                            {hasPermission(SECTION, "delete") && (
                                                <MenuItem onClick={() => deleteHandler(row.id)}>
                                                    <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                                                    Delete
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