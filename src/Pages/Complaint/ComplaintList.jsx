import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
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
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";
import ComplaintFilter from "./ComplaintFilter"; // <-- Import your filter component

import { getAllComplaints } from "../../Services/ComplaintApi";
import { StyledTableCell } from "../../compoents/TableComponents";

export default function ComplaintList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [filters, setFilters] = useAdminListState("filters", {
    searchQuery: "",
    startDate: "",
    endDate: "",
    issueCategory: "",
    ticketStatus: "",
  });

  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage] = useState(7);

  const [isExporting, setIsExporting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const navigate = useNavigate();

  // FETCH DATA
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllComplaints({
        page,
        rowsPerPage,
        ...filters, // <-- pass all filters to API
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
    } catch (err) {
      toast.error("Error fetching complaints");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    if (data.length < 1) {
      return toast.error("No data to export");
    }

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Complaints",
        columns: [
          { label: "Ticket ID", value: "ticketId" },
          { label: "Issue Category", value: "issueCategory" },
          { label: "Status", value: "ticketStatus" },
          { label: "Reporter Name", value: (row) => row?.reporter?.name },
          { label: "Reporter Email", value: (row) => row?.reporter?.email },
          { label: "Created At", value: "createdAt" },
        ],
        content: data,
      },
    ];

    try {
      xlsx(exportData, { fileName: "Complaint_List" });
      toast.success("Excel exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">{totalRecord} record{totalRecord === 1 ? "" : "s"} found</p>
        </div>
        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportExcel}
            className="btn-secondary"
          >
            {isExporting ? <LoderBtn /> : "Export Excel"}
          </motion.button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <ComplaintFilter
        appliedFilters={filters} // pass the applied filters to keep visible after apply
        onApply={(newFilters) => {
          setFilters(newFilters); // update applied filters
          setPage(1);
          fetchComplaints(); // fetch with applied filters
        }}
        onReset={() => {
          const empty = {
            searchQuery: "",
            startDate: "",
            endDate: "",
            issueCategory: "",
            ticketStatus: "",
            onModel: "",
          };
          setFilters(empty);
          setPage(1);
          fetchComplaints(); // fetch with cleared filters
        }}
      />
      {/* <ComplaintFilter
        onApply={(appliedFilters) => {
          setFilters(appliedFilters);
          setPage(1); // reset page
        }}
        onReset={() => {
          setFilters({
            searchQuery: "",
            startDate: "",
            endDate: "",
            issueCategory: "",
            ticketStatus: "",
          });
          setPage(1);
        }}
      /> */}

      {/* TABLE */}
      <TableContainer component={Paper} className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>SR</StyledTableCell>
              <StyledTableCell>PROFILE</StyledTableCell>
              <StyledTableCell>REPORTER</StyledTableCell>
              <StyledTableCell>ISSUE</StyledTableCell>
              <StyledTableCell>TICKET ID</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell align="center">ACTION</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" className="!py-14 !text-slate-400">
                  No Complaints Found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={row?.reporter?.profilePic || "/no-image.png"}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-black/5"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{row?.reporter?.name}</span>
                      <span className="text-xs text-slate-500">{row?.reporter?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{row.issueCategory}</TableCell>
                  <TableCell className="whitespace-nowrap !font-semibold !text-slate-900">{row.ticketId}</TableCell>
                  <TableCell>
                    <span className={`whitespace-nowrap capitalize ${row.ticketStatus === "resolved" ? "badge-success" : row.ticketStatus === "closed" ? "badge-neutral" : row.ticketStatus === "in_progress" ? "badge-info" : "badge-warning"}`}>
                      {row.ticketStatus}
                    </span>
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
                      <MenuItem onClick={() => navigate(`complaintView/${row.id}`)}>
                        <EyeIcon className="h-5 w-5 text-blue-600 mr-2" /> View
                      </MenuItem>
                      <MenuItem onClick={() => navigate(`updateComplaint/${row.id}`)}>
                        <PencilIcon className="h-5 w-5 text-green-600 mr-2" /> Edit
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
        <Stack alignItems="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Stack>
      )}
    </div>
  );
}