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
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";
import ComplaintFilter from "./ComplaintFilter"; // <-- Import your filter component

import { getAllComplaints } from "../../Services/ComplaintApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function ComplaintList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",
    issueCategory: "",
    ticketStatus: "",
  });

  const [page, setPage] = useState(1);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breaker />

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

      {/* TOP BAR */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-3"></div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={exportExcel}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          {isExporting ? <LoderBtn /> : "Export Excel"}
        </motion.button>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
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
                <TableCell colSpan={7} align="center">
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
                      className="w-12 h-12 rounded-full border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{row?.reporter?.name}</span>
                      <span className="text-sm text-gray-500">{row?.reporter?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{row.issueCategory}</TableCell>
                  <TableCell>{row.ticketId}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
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
        <Stack alignItems="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Stack>
      )}
    </div>
  );
}