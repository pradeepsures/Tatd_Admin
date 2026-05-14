import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { getAllSegment, SegmentDelete } from "../../Services/SegmentApi";
import { Modal } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";

import { getImageUrl } from "../../utils/imageUtils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "12px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    color: "#374151",
    padding: "12px 16px",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function SegmentList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);                    // raw data from backend (current page)
  const [filteredData, setFilteredData] = useState([]);    // client-side filtered
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");                // search input value
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [isLoading, setIsLoading] = useState(false);       // add button loading
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const navigate = useNavigate();

  // ─── Fetch data from backend (pagination only) ───────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // We do NOT send search param → full page data, filter on frontend
      const result = await getAllSegment({ page, rowsPerPage });

      if (result?.status) {
        const transformed = (result.data || []).map((item) => ({
          ...item,
          id: item._id,
        }));
        setData(transformed);
        setFilteredData(transformed); // initial filter = full data
        setTotalPages(result.totalPage || 1);
      } else {
        toast.error(result?.message || "Failed to load segments");
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast.error("Error loading segments");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading.profile, auth.user]);

  // ─── Client-side search filtering ────────────────────────────────────────────
  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) =>
      item.name?.toLowerCase().includes(term)
      // You can add more fields if needed, e.g.:
      // || item.description?.toLowerCase().includes(term)
    );

    setFilteredData(filtered);
  }, [search, data]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const deleteHandler = (id) => {
    Modal.confirm({
      title: "Delete Segment",
      content: "Are you sure you want to delete this segment? This cannot be undone.",
      okText: loading ? "Deleting..." : "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { disabled: loading },
      onOk: async () => {
        try {
          setLoading(true);
          const result = await SegmentDelete(id);
          if (result?.status) {
            toast.success("Segment deleted successfully!");
            fetchData();
          } else {
            toast.error(result?.message || "Failed to delete.");
          }
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Error deleting segment");
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
      navigate("createSegment");
      setIsLoading(false);
    }, 300);
  };

  const exportFunc = async () => {
    const exportSource = filteredData.length > 0 ? filteredData : data;

    if (exportSource.length < 1) {
      return toast.error("No segments to export!");
    }

    setIsExporting(true);

    const settings = {
      fileName: "Segments_List",
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    const exportSheet = [
      {
        sheet: "Segments",
        columns: [
          { label: "ID", value: (row) => row?._id || "" },
          { label: "Name", value: (row) => row?.name || "" },
          { label: "Description", value: (row) => row?.description || "" },
          { label: "Max Capacity", value: (row) => row?.maxCapacity ?? "" },
          { label: "Image Path", value: (row) => row?.image || "" },
          {
            label: "Created At",
            value: (row) =>
              row?.createdAt ? new Date(row.createdAt).toLocaleString() : "",
          },
        ],
        content: exportSource,
      },
    ];

    try {
      xlsx(exportSheet, settings);
      toast.success("Exported successfully!");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Render guards ───────────────────────────────────────────────────────────
  if (authLoading.profile) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breaker />
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search segments by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400"
            aria-label="Search segments"
          />
          {/* No separate Search button → filters live */}
        </div>

        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportFunc}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-green-700 transition-colors"
            disabled={isExporting}
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <LoderBtn /> Exporting...
              </span>
            ) : (
              "Export Excel"
            )}
          </motion.button>

          {hasPermission("Segment", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              data-aos="fade-left"
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition-shadow"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn /> Adding...
                </span>
              ) : (
                "Add Segment"
              )}
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table sx={{ minWidth: 700 }} aria-label="segment table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
              <StyledTableCell>Capacity</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={6}
                  align="center"
                  className="py-12 text-gray-500 text-lg"
                >
                  {search.trim()
                    ? "No matching segments found"
                    : "No segments found"}
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              filteredData.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>

                  <StyledTableCell>
                    {row.image ? (
                      <img
                        className="h-12 w-16 rounded-md object-cover border-2 border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        src={getImageUrl(row.image)}
                        alt={row.name || "Segment"}
                        onClick={() => navigate(`segmentview/${row.id}`)}
                        onError={(e) => (e.target.src = "/assets/placeholder.png")}
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                        N/A
                      </div>
                    )}
                  </StyledTableCell>

                  <StyledTableCell className="font-medium text-gray-800">
                    {row.name || "—"}
                  </StyledTableCell>

                  <StyledTableCell className="text-gray-600 max-w-xs truncate">
                    {row.description || "—"}
                  </StyledTableCell>

                  <StyledTableCell className="text-gray-700 font-medium">
                    {row.maxCapacity ?? "—"}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {(hasPermission("Segment", "read") ||
                      hasPermission("Segment", "update") ||
                      hasPermission("Segment", "delete")) && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                      PaperProps={{ className: "shadow-lg rounded-lg" }}
                    >
                      {hasPermission("Segment", "read") && (
                        <MenuItem
                          onClick={() => {
                            navigate(`segmentview/${row.id}`);
                            handleMenuClose();
                          }}
                          className="flex items-center gap-2"
                        >
                          <EyeIcon className="h-5 w-5 text-blue-600" />
                          View
                        </MenuItem>
                      )}

                      {hasPermission("Segment", "update") && (
                        <MenuItem
                          onClick={() => {
                            navigate(`updateSegment/${row.id}`);
                            handleMenuClose();
                          }}
                          className="flex items-center gap-2"
                        >
                          <PencilIcon className="h-5 w-5 text-green-600" />
                          Edit
                        </MenuItem>
                      )}

                      {hasPermission("Segment", "delete") && (
                        <MenuItem
                          onClick={() => deleteHandler(row.id)}
                          className="flex items-center gap-2"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                          Delete
                        </MenuItem>
                      )}
                    </Menu>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
          />
        </Stack>
      )}
    </div>
  );
}