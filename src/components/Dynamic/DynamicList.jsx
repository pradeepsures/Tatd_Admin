import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Menu, MenuItem, Pagination, Stack
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";

import Loader from "../../../src/compoents/Loader";
import LoderBtn from "../../../src/compoents/LoderBtn";
import Breaker from "../../../src/compoents/Breaker";
import { StyledTableCell } from "../../../src/compoents/TableComponents";
import { useAuth } from "../../auth/AuthContext";
import { GenericApi } from "../../Services/GenericApi";
import { getImageUrl } from "../../utils/imageUtils";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
  "&:hover": { backgroundColor: "#f1f5f9", transition: "background-color 0.2s ease" },
  "&:last-child td, &:last-child th": { border: 0 },
}));

const getNestedValue = (obj, path) => {
  if (!obj || typeof obj !== "object") return "";
  if (!path) return obj;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current == null || !(key in current)) return "";
    current = current[key];
  }

  return current;
};

const getDisplayValue = (row, key) => {
  const value = getNestedValue(row, key);

  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") {
    return value.name || value._id || value.label || "N/A";
  }

  return value;
};

export default function DynamicList({ config }) {
  const { title, endpoint, columns, permissions, basePath } = config;
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await GenericApi.fetchList(endpoint, { page, rowsPerPage, searchQuery });
      if (result?.status) {
        // toast.success(`${title} fetched successfully!`); // Avoid spamming toasts on mount
        const transformedData = (result.data || []).map((item) => ({ ...item, id: item._id }));
        setData(transformedData);
        setTotalPages(result.totalPage || 0);
        setTotalRecord(result.totalResult || 0);
      } else {
        toast.error(result?.message || `Failed to fetch ${title}.`);
      }
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, rowsPerPage, searchQuery, title]);

  useEffect(() => {
    if (!authLoading && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading, auth.user]);

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
      title: `Delete ${title}`,
      content: `Are you sure you want to delete this ${title.toLowerCase()}? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await GenericApi.deleteRecord(endpoint, id);
          if (result?.status) {
            toast.success(`${title} deleted successfully!`);
            fetchData();
          } else {
            toast.error(result?.message || `Failed to delete ${title}.`);
          }
        } catch (error) {
          console.error(`Error deleting ${title}:`, error);
        }
      },
    });
    handleMenuClose();
  };

  const exportFunc = () => {
    if (data.length < 1) return toast.error(`${title} list is empty!`);
    setIsExporting(true);
    const settings = { fileName: `Dvagoo_${title.replace(/\s+/g, '_')}`, extraLength: 3, writeMode: "writeFile", writeOptions: {}, RTL: false };
    const exportColumns = columns.map(col => ({ label: col.label, value: (row) => getDisplayValue(row, col.key) === "N/A" ? "" : getDisplayValue(row, col.key) }));
    exportColumns.unshift({ label: "ID", value: (row) => row._id || "" });
    
    try {
      xlsx([{ sheet: `${title} List`, columns: exportColumns, content: data }], settings);
      toast.success("Exported to Excel successfully!");
    } catch (error) {
      toast.error("Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (loading && data.length === 0) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6"><Breaker /></div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportFunc}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-green-700 transition-colors"
          >
            {isExporting ? <span className="flex items-center gap-2"><LoderBtn />Exporting...</span> : "Export Excel"}
          </motion.button>
          {hasPermission(permissions, "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`${basePath}/create`)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-blue-700 transition-colors"
            >
              Add {title}
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              {columns.map((col, i) => (
                <StyledTableCell key={i}>{col.label}</StyledTableCell>
              ))}
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={columns.length + 2} align="center" className="py-8 text-gray-500 text-lg">
                  No {title.toLowerCase()} found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>
                  {columns.map((col, i) => (
                    <StyledTableCell key={i}>
                      {col.type === "image" ? (
                        <img src={getImageUrl(row[col.key])} alt={col.label} className="h-10 w-10 rounded-full object-cover shadow-sm" onError={(e) => e.target.src = "/assets/placeholder.png"} />
                      ) : col.type === "boolean" ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${Boolean(getNestedValue(row, col.key)) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {Boolean(getNestedValue(row, col.key)) ? "Yes" : "No"}
                        </span>
                      ) : (
                        getDisplayValue(row, col.key)
                      )}
                    </StyledTableCell>
                  ))}
                  <StyledTableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)} className="text-gray-500 hover:text-gray-700">
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRowId === row.id} onClose={handleMenuClose}>
                      {hasPermission(permissions, "read") && (
                        <MenuItem onClick={() => { navigate(`${basePath}/view/${row.id}`); handleMenuClose(); }} className="flex gap-2">
                          <EyeIcon className="h-5 w-5 text-blue-600" /> View
                        </MenuItem>
                      )}
                      {hasPermission(permissions, "update") && (
                        <MenuItem onClick={() => { navigate(`${basePath}/update/${row.id}`); handleMenuClose(); }} className="flex gap-2">
                          <PencilIcon className="h-5 w-5 text-green-600" /> Edit
                        </MenuItem>
                      )}
                      {hasPermission(permissions, "delete") && (
                        <MenuItem onClick={() => deleteHandler(row.id)} className="flex gap-2">
                          <TrashIcon className="h-5 w-5 text-red-600" /> Delete
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

      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" className="rounded-lg p-2" />
        </Stack>
      )}
    </div>
  );
}
