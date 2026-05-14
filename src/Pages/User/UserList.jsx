import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";
import {
  getAllAdmins,
  deleteAdmin,
  getAllUserExcell,
} from "../../Services/UserApi";
import { Modal } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../../utils/imageUtils";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://your-default-base-url.com";

// Local date format (timezone safe)
const formatLocalDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #5F0099, #9F00FF)",
    color: "white",
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "10px 12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.95rem",
    color: "#374151",
    padding: "8px 10px",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": { border: 0 },
}));

export default function AdminList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [zeroBalance, setZeroBalance] = useState(false);
  const [notZeroBalance, setNotZeroBalance] = useState(false);
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        page,
        rowsPerPage,
        searchQuery: searchQuery.trim() || undefined,
        startDate: startDate ? formatLocalDate(startDate) : undefined,
        endDate: endDate ? formatLocalDate(endDate) : undefined,
        zeroBalance: zeroBalance || undefined,
        notZeroBalance: notZeroBalance || undefined,
        lang: selectedLanguage,
      };

      const result = await getAllAdmins(payload);

      if (result?.status) {
        const items = result.data || result.users || result.results || [];
        const transformed = items.map((item) => ({ ...item, id: item._id }));

        setData(transformed);

        const total =
          result.total ||
          result.count ||
          result.totalRecords ||
          result.totalDocs ||
          result.totalResult ||
          result.totalCount ||
          items.length ||
          0;

        const pages =
          result.totalPages ||
          result.totalPage ||
          result.pages ||
          (rowsPerPage > 0 ? Math.ceil(total / rowsPerPage) : 1) ||
          1;

        setTotalPages(pages);
        setTotalRecord(total);
      } else {
        toast.error(result?.message || "Failed to load admins");
      }
    } catch (error) {
      console.error("Fetch admins error:", error);
      toast.error("Error loading admin list");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    searchQuery,
    startDate,
    endDate,
    zeroBalance,
    notZeroBalance,
    selectedLanguage,

  ]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) fetchData();
  }, [fetchData, authLoading.profile, auth.user]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, disable: "mobile" });
    return () => AOS.refresh();
  }, []);

  const handleSearch = () => {
    setSearchQuery(search.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setZeroBalance(false);
    setNotZeroBalance(false);
    setPage(1);
    toast.success("Filters cleared");
  };

  const handlePageChange = (e, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(1);
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleFilterMenuOpen = (event) =>
    setFilterAnchorEl(event.currentTarget);
  const handleFilterMenuClose = () => setFilterAnchorEl(null);

  const applyFilters = () => {
    setPage(1);
    fetchData();
    handleFilterMenuClose();
    toast.success("Filters applied");
  };

  const handleDateFilterModalOk = () => {
    if (!tempStartDate || !tempEndDate) return toast.error("Select both dates");
    if (tempEndDate < tempStartDate)
      return toast.error("End date before start date");
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
    setIsDateFilterModalOpen(false);
    toast.success("Date range applied");
  };

  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Admin",
      content: "Are you sure? This cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteAdmin(id);
          if (res?.status) {
            toast.success("Deleted successfully");
            fetchData();
          } else {
            toast.error(res?.message || "Delete failed");
          }
        } catch {
          toast.error("Error deleting admin");
        } finally {
          setLoading(false);
        }
      },
    });
    handleMenuClose();
  };

  const handleAddClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("createuser");
      setIsLoading(false);
    }, 300);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportPayload = {
        searchQuery: searchQuery || "",
        startDate: startDate ? formatLocalDate(startDate) : "",
        endDate: endDate ? formatLocalDate(endDate) : "",
      };

      const usersData = await getAllUserExcell(exportPayload);

      if (!usersData || usersData.length === 0) {
        toast.error("No data found to export!");
        return;
      }

      exportToExcel(usersData);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = (allUsersData) => {
    const today = new Date().toISOString().slice(0, 10);
    const settings = {
      fileName: `Mann_Admins_${today}`,
      extraLength: 3,
      writeMode: "writeFile",
    };

    const dataToExport = [
      {
        sheet: "Admins",
        columns: [
          { label: "Sr. No.", value: (row, index) => index + 1 },
          { label: "Admin ID", value: (row) => row?._id || "N/A" },
          { label: "Name", value: (row) => row?.name || "N/A" },
          { label: "Email", value: (row) => row?.email || "N/A" },
          { label: "Mobile", value: (row) => row?.mobile || "N/A" },
          { label: "Gender", value: (row) => row?.gender || "N/A" },
          {
            label: "Wallet Balance",
            value: (row) => row?.wallet?.balance ?? "0",
          },
          {
            label: "Status",
            value: (row) => (row?.status ? "Active" : "Inactive"),
          },
          {
            label: "Created At",
            value: (row) =>
              row?.createdAt
                ? new Date(row.createdAt).toLocaleString("en-IN")
                : "N/A",
          },
        ],
        content: allUsersData,
      },
    ];

    try {
      xlsx(dataToExport, settings);
      toast.success("Exported successfully!");
    } catch (err) {
      console.error("Excel error:", err);
      toast.error("Failed to generate Excel");
    }
  };

  if (authLoading.profile) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (loading) return <Loader />;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Breaker />
      </div>

      {/* Search + Buttons */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[280px] max-w-md w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleSearch}
            className="bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white px-6 py-2.5 rounded-lg font-medium shadow hover:brightness-105"
          >
            Search
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-2.5 rounded-lg font-medium shadow hover:brightness-105"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap gap-3">

       <Select
  value={selectedLanguage}
  onChange={(e) => {
    setSelectedLanguage(e.target.value);
    setPage(1);
  }}
  size="small"
  sx={{ minWidth: 120 }}
>
  <MenuItem value="en">English</MenuItem>
  <MenuItem value="hi">Hindi</MenuItem>
  <MenuItem value="pa">Punjabi</MenuItem>
  <MenuItem value="bn">Bengali</MenuItem>
  <MenuItem value="ta">Tamil</MenuItem>
  <MenuItem value="te">Telugu</MenuItem>
  <MenuItem value="gu">Gujarati</MenuItem>
  <MenuItem value="mr">Marathi</MenuItem>
</Select>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleFilterMenuOpen}
            className="bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white px-6 py-2.5 rounded-lg font-medium shadow hover:brightness-105"
          >
            Filters
          </motion.button>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterMenuClose}
            PaperProps={{ sx: { minWidth: 280 } }}
          >
            <div className="px-4 py-3 border-b">
              <h6 className="font-semibold  text-gray-800">Filters</h6>
            </div>

            <MenuItem
              onClick={() => {
                setTempStartDate(startDate);
                setTempEndDate(endDate);
                setIsDateFilterModalOpen(true);
                handleFilterMenuClose();
              }}
            >
              Date Range{" "}
              {startDate && endDate && (
                <span className="ml-2 text-xs text-green-600">(Active)</span>
              )}
            </MenuItem>

            <div className="px-4 py-3 border-t mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Wallet Balance
              </p>
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                <input
                  type="checkbox"
                  checked={zeroBalance}
                  onChange={(e) => {
                    setZeroBalance(e.target.checked);
                    if (e.target.checked) setNotZeroBalance(false);
                    setPage(1);
                    fetchData();
                  }}
                  className="h-4 w-4 text-red-600"
                />
                <span>Zero Balance</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                <input
                  type="checkbox"
                  checked={notZeroBalance}
                  onChange={(e) => {
                    setNotZeroBalance(e.target.checked);
                    if (e.target.checked) setZeroBalance(false);
                    setPage(1);
                    fetchData();
                  }}
                  className="h-4 w-4 text-red-600"
                />
                <span>Has Balance</span>
              </label>
            </div>

            <div className="p-3 border-t flex gap-2">
              {/* <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded font-medium"
              >
                Apply
              </button> */}
              <button
                onClick={() => {
                  setZeroBalance(false);
                  setNotZeroBalance(false);
                  setPage(1);
                  fetchData();
                  handleFilterMenuClose();
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-medium hover:bg-gray-300"
              >
                Clear Balance
              </button>
            </div>
          </Menu>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={isExporting}
            className={`px-6 py-2.5 rounded-lg font-medium shadow transition ${isExporting
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <LoderBtn /> Exporting...
              </span>
            ) : (
              "Export Excel"
            )}
          </motion.button>

          {hasPermission("User", "create") && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddClick}
              className="bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white px-6 py-2.5 rounded-lg font-medium shadow hover:brightness-105"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn /> Add Admin
                </span>
              ) : (
                "Add Admin"
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Date Modal */}
      <Modal
        title="Select Date Range"
        open={isDateFilterModalOpen}
        onOk={handleDateFilterModalOk}
        onCancel={() => setIsDateFilterModalOpen(false)}
        okText="Apply"
        cancelText="Cancel"
      >
        <div className="flex flex-col sm:flex-row gap-6 p-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={tempStartDate}
              onChange={setTempStartDate}
              selectsStart
              startDate={tempStartDate}
              endDate={tempEndDate}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={tempEndDate}
              onChange={setTempEndDate}
              selectsEnd
              startDate={tempStartDate}
              endDate={tempEndDate}
              minDate={tempStartDate}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border rounded-lg"
              disabled={!tempStartDate}
            />
          </div>
        </div>
      </Modal>

      {/* Table */}
      <TableContainer
        component={Paper}
        className="shadow-lg rounded-lg overflow-hidden"
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name & Contact</StyledTableCell>
              <StyledTableCell>Wallet Balance</StyledTableCell>
              <StyledTableCell>Gender</StyledTableCell>
              <StyledTableCell>Created At</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={7}
                  align="center"
                  className="py-12 text-gray-500"
                >
                  No admins found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-medium text-gray-900">
                      {row.name || "—"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {row.email || "—"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {row.mobile || "—"}
                    </div>
                  </StyledTableCell>
                  <StyledTableCell className="font-medium">
                    {row.wallet?.balance != null
                      ? `₹${row.wallet.balance}`
                      : "—"}
                  </StyledTableCell>
                  <StyledTableCell>{row.gender || "—"}</StyledTableCell>
                  <StyledTableCell>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${row.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {(hasPermission("User", "read") ||
                      hasPermission("User", "update") ||
                      hasPermission("User", "delete")) && (
                        <>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, row.id)}
                            size="small"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRowId === row.id}
                            onClose={handleMenuClose}
                          >
                            {hasPermission("User", "read") && (
                              <MenuItem
                                onClick={() => {
                                  navigate(`viewuser/${row.id}`);
                                  handleMenuClose();
                                }}
                              >
                                <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />{" "}
                                View
                              </MenuItem>
                            )}
                            {hasPermission("User", "update") && (
                              <MenuItem
                                onClick={() => {
                                  navigate(`updateuser/${row.id}`);
                                  handleMenuClose();
                                }}
                              >
                                <PencilIcon className="h-5 w-5 text-green-600 mr-2" />{" "}
                                Edit
                              </MenuItem>
                            )}
                            {hasPermission("User", "delete") && (
                              <MenuItem onClick={() => deleteHandler(row.id)}>
                                <TrashIcon className="h-5 w-5 text-red-600 mr-2" />{" "}
                                Delete
                              </MenuItem>
                            )}
                          </Menu>
                        </>
                      )}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Rows per page:</span>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              sx={{ minWidth: 80 }}
            >
              {[7, 15, 25, 50, 100, 500].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </div>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </div>
      )}
    </div>
  );
}