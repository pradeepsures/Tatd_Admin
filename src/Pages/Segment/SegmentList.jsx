import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
    background: "#f9fafb",
    color: "#667085",
    fontWeight: 700,
    fontSize: "0.72rem",
    padding: "14px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid rgba(16,24,40,0.08)",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.86rem",
    color: "#1f2937",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(248,250,252,0.45)",
  },
  "&:hover": {
    backgroundColor: "rgba(16,24,40,0.08)",
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
  const [search, setSearch] = useAdminListState("search", "");                // search input value
  const [page, setPage] = useAdminListState("page", 1);
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
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Segments</h1>
        </div>

        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportFunc}
            className="btn-secondary"
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
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn /> Adding...
                </span>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add Segment
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <div className="card card-pad">
        <div className="relative w-full sm:w-auto">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search segments by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-field sm:w-96"
            aria-label="Search segments"
          />
          {/* No separate Search button → filters live */}
        </div>
      </div>

      <TableContainer component={Paper} className="overflow-hidden">
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
                  className="!py-14 !text-slate-400"
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
                        className="h-12 w-16 cursor-pointer rounded-xl object-cover shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-90"
                        src={getImageUrl(row.image)}
                        alt={row.name || "Segment"}
                        onClick={() => navigate(`segmentview/${row.id}`)}
                        onError={(e) => (e.target.src = "/assets/placeholder.png")}
                      />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-slate-100 text-xs font-medium text-slate-400 ring-1 ring-black/5">
                        N/A
                      </div>
                    )}
                  </StyledTableCell>

                  <StyledTableCell className="!font-semibold !text-slate-900">
                    {row.name || "—"}
                  </StyledTableCell>

                  <StyledTableCell className="max-w-xs truncate !text-slate-500">
                    {row.description || "—"}
                  </StyledTableCell>

                  <StyledTableCell className="!font-medium !text-slate-700">
                    {row.maxCapacity ?? "—"}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {(hasPermission("Segment", "read") ||
                      hasPermission("Segment", "update") ||
                      hasPermission("Segment", "delete")) && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.id)}
                        className="!text-slate-500 hover:!text-slate-900"
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
        <Stack spacing={2} alignItems="center" marginTop={2}>
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