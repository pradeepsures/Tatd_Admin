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
import Switch from "@mui/material/Switch";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { Modal } from "antd";
import xlsx from "json-as-xlsx";

import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import Breaker from "../../compoents/Breaker";

import {
  getAllAirportRegions,
  toggleAirportRegionStatus,
  deleteAirportRegion,
} from "../../Services/AirportRegionApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
    fontWeight: 600,
  },
}));

export default function AirportRegionList() {
  const { hasPermission, authLoading, auth } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);

  const [isExporting, setIsExporting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const navigate = useNavigate();

  const fetchRegions = useCallback(async () => {

    try {

      setLoading(true);

      const result = await getAllAirportRegions({
        page,
        rowsPerPage,
        searchQuery,
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

    } catch {
      toast.error("Error fetching regions");
    } finally {
      setLoading(false);
    }

  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setSelectedRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  // ✅ TOGGLE STATUS
  const handleToggle = async (id) => {

    try {

      const res = await toggleAirportRegionStatus(id);

      if (res?.status) {
        toast.success("Status updated");
        fetchRegions();
      }

    } catch {
      toast.error("Failed to update status");
    }

  };

  // ✅ DELETE
  const handleDelete = (id) => {

    Modal.confirm({
      title: "Delete Region",
      content: "Are you sure you want to delete this region?",
      okType: "danger",

      onOk: async () => {

        try {

          const res = await deleteAirportRegion(id);

          if (res?.status) {
            toast.success("Deleted successfully");
            fetchRegions();
          }

        } catch {
          toast.error("Delete failed");
        }

      },
    });

  };

  // EXPORT
  const exportExcel = () => {

    if (data.length < 1) return toast.error("No data");

    setIsExporting(true);

    const exportData = [
      {
        sheet: "Airport Regions",
        columns: [
          { label: "Name", value: "name" },
          { label: "Address", value: "address" },
          { label: "Latitude", value: "centerLat" },
          { label: "Longitude", value: "centerLng" },
          { label: "Radius", value: "radiusMeters" },
          { label: "Status", value: (r) => (r.isActive ? "Active" : "Inactive") },
        ],
        content: data,
      },
    ];

    try {
      xlsx(exportData, { fileName: "Airport_Regions" });
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

      {/* TOP BAR */}
      <div className="flex justify-between mb-6 mt-5">

        <div className="flex gap-3">

          <input
            placeholder="Search name / address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg"
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
            onClick={() => navigate("create")}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Create
          </motion.button> */}
          {hasPermission("AirportRegions", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("create")}
              className="bg-primary text-white px-5 py-2 rounded-lg"
            >
              Create
            </motion.button>
          )}

        </div>

      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>

        <Table>

          <TableHead>
            <TableRow>

              <StyledTableCell>SR</StyledTableCell>
              <StyledTableCell>NAME</StyledTableCell>
              <StyledTableCell>ADDRESS</StyledTableCell>
              <StyledTableCell>LAT / LNG</StyledTableCell>
              <StyledTableCell>RADIUS</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell align="center">ACTIONS</StyledTableCell>

            </TableRow>
          </TableHead>

          <TableBody>

            {data.map((row, index) => (

              <TableRow key={row.id}>

                <TableCell>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>

                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>

                <TableCell>
                  {row.centerLat}, {row.centerLng}
                </TableCell>

                <TableCell>{row.radiusMeters} m</TableCell>

                {/* ✅ TOGGLE */}
                <TableCell>
                  <Switch
                    checked={row.isActive}
                    onChange={() => handleToggle(row.id)}
                  />
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

                    {/* <MenuItem onClick={() => navigate(`airportRegionsDetails/${row.id}`)}>
                      <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      View
                    </MenuItem> */}
                    {hasPermission("AirportRegions", "view") && (
                      <MenuItem onClick={() => navigate(`airportRegionsDetails/${row.id}`)}>
                        <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                        View
                      </MenuItem>
                    )}

                    {/* <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem> */}
                    {hasPermission("AirportRegions", "edit") && (
                      <MenuItem onClick={() => navigate(`update/${row.id}`)}>
                        <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                        Edit
                      </MenuItem>
                    )}

                    {/* <MenuItem onClick={() => handleDelete(row.id)}>
                      <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                      Delete
                    </MenuItem> */}
                    {hasPermission("AirportRegions", "delete") && (
                      <MenuItem onClick={() => handleDelete(row.id)}>
                        <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                        Delete
                      </MenuItem>
                    )}

                  </Menu>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

      {/* PAGINATION */}
      {totalRecord > rowsPerPage && (
        <Stack alignItems="center" mt={4}>
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