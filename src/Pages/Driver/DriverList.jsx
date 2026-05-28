// import * as React from "react";
import React, { useEffect, useState, useCallback } from "react";
// import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Stack,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import Loader from "../../compoents/Loader";
import Breaker from "../../compoents/Breaker";

import { getAllDrivers, deleteDriver } from "../../Services/DriverApi";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    color: "#374151",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "0.2s",
  },
}));

export default function DriverList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [stats, setStats] = useState(null);

  // SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // FILTER PANEL (draft)
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    startDate: "",
    endDate: "",
  });

  // ✅ APPLIED FILTERS (only used for API)
  const [appliedFilters, setAppliedFilters] = useState({
    isVerified: "",
    isOnline: "",
    isAvailable: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  // FETCH
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllDrivers({
        page,
        limit: rowsPerPage,
        search: searchQuery,
        isVerified: appliedFilters.isVerified || undefined,
        isOnline: appliedFilters.isOnline || undefined,
        isAvailable: appliedFilters.isAvailable || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      });

      if (result?.status) {
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
  }, [page, searchQuery, appliedFilters]);

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

  const deleteHandler = async (id) => {
    try {
      const res = await deleteDriver(id);
      if (res?.status) {
        toast.success("Driver deleted");
        fetchDrivers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePageChange = (e, value) => setPage(value);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <Breaker />

        {stats && (
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white px-4 py-2 rounded-lg text-sm flex gap-3 flex-wrap">
            <span>Total: {stats.total}</span>
            <span>Verified: {stats.verifiedCount}</span>
            <span>Unverified: {stats.unverifiedCount}</span>
            <span>Online: {stats.onlineCount}</span>
          </div>
        )}
      </div>

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6">
        {/* SEARCH */}
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name / email / phone"
            className="border px-3 py-2 rounded w-80"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>

          {/* CLEAR ONLY */}
          <button
            onClick={clearFilters}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear
          </button>

          <button
            onClick={() => navigate("createDriver")}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            + Create Driver
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3">
          <select
            value={filters.isVerified}
            onChange={(e) =>
              setFilters({ ...filters, isVerified: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Verified</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            value={filters.isOnline}
            onChange={(e) =>
              setFilters({ ...filters, isOnline: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Online</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <select
            value={filters.isAvailable}
            onChange={(e) =>
              setFilters({ ...filters, isAvailable: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Available</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border p-2 rounded"
          />

          {/* APPLY */}
          <button
            onClick={applyFilters}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>

          {/* CLEAR ONLY */}
          {/* <button
                        onClick={clearFilters}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Clear
                    </button> */}
        </div>
      )}

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Profile</StyledTableCell>
              <StyledTableCell>Details</StyledTableCell>
              <StyledTableCell>Address</StyledTableCell>
              <StyledTableCell>Verified</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No Drivers Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  {/* S.NO */}
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>

                  {/* PROFILE */}
                  <TableCell>
                    <img
                      src={row.profilePic || "/no-image.png"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>

                  {/* DETAILS */}
                  <TableCell>
                    <div>
                      <div className="font-semibold">
                        {[row.name, row.midName, row.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {row.email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500">{row.phone}</div>
                    </div>
                  </TableCell>

                  {/* address */}
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {row.permanentAddress || "No Adress"}
                    </div>
                  </TableCell>

                  {/* VERIFIED */}
                  <TableCell>
                    <span
                      className={
                        row.isVerified ? "text-green-600" : "text-red-600"
                      }
                    >
                      {row.isVerified ? "Verified" : "Pending"}
                    </span>
                  </TableCell>

                  {/* ACTIONS (3 DOT MENU) */}
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedRowId(row.id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={() => {
                        setAnchorEl(null);
                        setSelectedRowId(null);
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          navigate(`driverView/${row.id}`);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <EyeIcon className="w-5 h-5 text-blue-600 mr-2" />
                        View
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          navigate(`updateDriver/${row.id}`);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <PencilIcon className="w-5 h-5 text-green-600 mr-2" />
                        Edit
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          deleteHandler(row.id);
                          setAnchorEl(null);
                          setSelectedRowId(null);
                        }}
                      >
                        <TrashIcon className="w-5 h-5 text-red-600 mr-2" />
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" mt={3}>
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
