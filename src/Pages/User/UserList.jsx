import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
import { EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../../utils/imageUtils";
import { StyledTableCell } from "../../compoents/TableComponents";

// Local date format (timezone safe)
const formatLocalDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StyledTableRow = styled(TableRow)(() => ({
  "&:hover": {
    backgroundColor: "#f9fafb",
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
  const [search, setSearch] = useAdminListState("search", "");
  const [searchQuery, setSearchQuery] = useAdminListState("searchQuery", "");
  const [startDate, setStartDate] = useAdminListState("startDate", null);
  const [endDate, setEndDate] = useAdminListState("endDate", null);
  const [zeroBalance, setZeroBalance] = useAdminListState("zeroBalance", false);
  const [notZeroBalance, setNotZeroBalance] = useAdminListState("notZeroBalance", false);
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useAdminListState("tempStartDate", null);
  const [tempEndDate, setTempEndDate] = useAdminListState("tempEndDate", null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [page, setPage] = useAdminListState("page", 1);
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

  ]);

  useEffect(() => {
    if (!authLoading && auth.user) fetchData();
  }, [fetchData, authLoading, auth.user]);

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
      fileName: `Dvagoo_AppUsers_${today}`,
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

  if (authLoading) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">App Users</h1>
          <p className="page-subtitle">{totalRecord} records</p>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="card card-pad flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="btn-primary flex-1 sm:flex-none"
            >
              Search
            </button>
            <button
              onClick={handleClearFilters}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleFilterMenuOpen}
            className="btn-secondary"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </motion.button>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterMenuClose}
            PaperProps={{ sx: { minWidth: 280, borderRadius: "16px" } }}
          >
            <div className="border-b border-slate-200/70 px-4 py-3">
              <h6 className="text-sm font-bold text-slate-900">Filters</h6>
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
                <span className="badge-success ml-2">Active</span>
              )}
            </MenuItem>

            <div className="mt-2 border-t border-slate-200/70 px-4 py-3">
              <p className="section-label mb-2">
                Wallet Balance
              </p>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={zeroBalance}
                  onChange={(e) => {
                    setZeroBalance(e.target.checked);
                    if (e.target.checked) setNotZeroBalance(false);
                    setPage(1);
                    fetchData();
                  }}
                  className="h-4 w-4 rounded accent-[#111827]"
                />
                <span>Zero Balance</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={notZeroBalance}
                  onChange={(e) => {
                    setNotZeroBalance(e.target.checked);
                    if (e.target.checked) setZeroBalance(false);
                    setPage(1);
                    fetchData();
                  }}
                  className="h-4 w-4 rounded accent-[#111827]"
                />
                <span>Has Balance</span>
              </label>
            </div>

            <div className="flex gap-2 border-t border-slate-200/70 p-3">
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
                className="btn-secondary w-full"
              >
                Clear Balance
              </button>
            </div>
          </Menu>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={isExporting}
            className={`btn-success ${isExporting
              ? "cursor-not-allowed opacity-60"
              : ""
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
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn /> Add User
                </span>
              ) : (
                "Add User"
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
        <div className="flex flex-col gap-5 py-3 sm:flex-row">
          <div className="flex-1">
            <label className="field-label">Start Date</label>
            <DatePicker
              selected={tempStartDate}
              onChange={setTempStartDate}
              selectsStart
              startDate={tempStartDate}
              endDate={tempEndDate}
              dateFormat="yyyy-MM-dd"
              className="field"
            />
          </div>
          <div className="flex-1">
            <label className="field-label">End Date</label>
            <DatePicker
              selected={tempEndDate}
              onChange={setTempEndDate}
              selectsEnd
              startDate={tempStartDate}
              endDate={tempEndDate}
              minDate={tempStartDate}
              dateFormat="yyyy-MM-dd"
              className="field"
              disabled={!tempStartDate}
            />
          </div>
        </div>
      </Modal>

      {/* Table */}
      <TableContainer
        component={Paper}
        className="overflow-hidden"
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Profile</StyledTableCell>
              <StyledTableCell>Name & Contact</StyledTableCell>
              <StyledTableCell>Total Trips</StyledTableCell>
              <StyledTableCell>Total Spent</StyledTableCell>
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
                  colSpan={8}
                  align="center"
                  className="!py-14 !text-slate-400"
                >
                  No app users found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>
                    <img
                      src={getImageUrl(row.profileImage || row.profilePic) || "/no-image.png"}
                      alt="profile"
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-black/5"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-semibold text-slate-900">
                      {row.name || "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {row.email || "—"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {row.mobile || "—"}
                    </div>
                  </StyledTableCell>
                  <StyledTableCell className="font-medium">
                    {row.totalTrips ?? 0}
                  </StyledTableCell>
                  <StyledTableCell className="font-medium text-green-700">
                    {row.totalSpent != null ? `₹${row.totalSpent}` : "₹0"}
                  </StyledTableCell>
                  <StyledTableCell>{row.gender || "—"}</StyledTableCell>
                  <StyledTableCell>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={row.status
                        ? "badge-success"
                        : "badge-danger"
                        }
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
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Rows per page:</span>
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