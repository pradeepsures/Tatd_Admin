import React, { useEffect, useState, useCallback } from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
  "&:hover": { backgroundColor: "#f9fafb", transition: "background-color 0.12s ease" },
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
  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useAdminListState("searchQuery", "");
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
    <div className="page-shell">
      <Breaker />
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{totalRecord} record{totalRecord === 1 ? "" : "s"} found</p>
        </div>
        <div className="page-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportFunc}
            className="btn-secondary"
          >
            {isExporting ? <span className="flex items-center gap-2"><LoderBtn />Exporting...</span> : "Export Excel"}
          </motion.button>
          {hasPermission(permissions, "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`${basePath}/create`)}
              className="btn-primary"
            >
              Add {title}
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer component={Paper} className="overflow-hidden">
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
                <StyledTableCell colSpan={columns.length + 2} align="center" className="!py-12 !text-gray-500">
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
                        <img src={getImageUrl(row[col.key])} alt={col.label} className="h-9 w-9 rounded-md object-cover ring-1 ring-gray-200" onError={(e) => e.target.src = "/assets/placeholder.png"} />
                      ) : col.type === "boolean" ? (
                        <span className={Boolean(getNestedValue(row, col.key)) ? "badge-success" : "badge-danger"}>
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
        <Stack spacing={2} alignItems="center" marginTop={4}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" className="rounded-lg p-2" />
        </Stack>
      )}
    </div>
  );
}
