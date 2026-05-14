import * as React from "react";
import { useEffect, useState } from "react";
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
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Breaker from "../../compoents/Breaker";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import {
  getAllMember,
  MemberDelete,
} from "../../Services/MemberApi";
import { Button, Modal } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext"; // Added for permissions

import { getImageUrl } from "../../utils/imageUtils";

const BASE_URL = import.meta.env.VITE_BASE_URL;


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
    color: "#fff",
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

export default function MemberList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllMember({ page, rowsPerPage, search: appliedSearch });

      if (result?.status) {
        toast.success("Members fetched successfully!");
        console.log("Fetched Member Data:", result.data);

        const transformedData = result.data.user.map((item) => ({
          ...item,
          id: item._id,
        }));

        setData(transformedData);
        setTotalPages(result.totalPage || 0);
        setTotalRecord(result.totalResult || 0);
      } else {
        toast.error(result?.message || "Failed to fetch members.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [page, rowsPerPage, appliedSearch, authLoading.profile, auth.user]);

  const exportExcel = async () => {
    setIsExporting(true);

    try {
      const res = await getAllMember({ page: 1, rowsPerPage: 10000, search: appliedSearch });

      if (res?.status) {
        const allData = res.data.user;

        const exportData = [
          {
            sheet: "Members",
            columns: [
              { label: "Sr. No.", value: (row, index) => index + 1 },
              { label: "Username", value: "userName" },
              { label: "Email", value: "email" },
              { label: "Role", value: (r) => r?.role?.name || "N/A" },
              {
                label: "Profile Image",
                value: (r) =>
                  r?.profileImage
                    ? r.profileImage.startsWith("http")
                      ? r.profileImage
                      : getImageUrl(r.profileImage)
                    : "N/A",
              },
              {
                label: "Created At",
                value: (r) =>
                  r?.createdAt
                    ? new Date(r.createdAt).toLocaleString("en-IN")
                    : "N/A",
              },
            ],
            content: allData,
          },
        ];

        xlsx(exportData, { fileName: "Member_List" });
      } else {
        toast.error("Failed to fetch data for export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
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
      title: "Delete Member",
      content:
        "Are you sure you want to delete this member? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await MemberDelete(id);
          if (result) {
            toast.success("Member deleted successfully!");
            fetchData();
          } else {
            toast.error(result?.message || "Failed to delete member.");
          }
        } catch (error) {
          console.error("Error deleting member:", error);
          toast.error("Error deleting member.");
        }
      },
    });
    handleMenuClose();
  };

  const handleAddClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("createmember");
      setIsLoading(false);
    }, 300);
  };
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
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 px-4 py-2.5 border rounded-lg"
          />
          <button
            onClick={() => {
              setAppliedSearch(searchQuery);
              setPage(1);
            }}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium"
          >
            Search
          </button>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <LoderBtn />
                Exporting...
              </span>
            ) : (
              "Export Excel"
            )}
          </motion.button>

          {hasPermission("Member", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              className="bg-primary text-white px-5 py-2.5 rounded-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn />
                  Add Member
                </span>
              ) : (
                "Add Member"
              )}
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Profile</StyledTableCell>
              <StyledTableCell>User Details </StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell>Created AT</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={4} align="center">
                  No members found
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
                      src={row.profileImage ? getImageUrl(row.profileImage) : "/default-profile.png"}
                      alt={row.userName || "Profile"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="text-sm font-medium">
                      {row.userName || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-500">Email: </span>
                      {row.email || ""}
                    </div>
                    <div className="mt-2 text-xs text-gray-600"></div>
                  </StyledTableCell>
                  <StyledTableCell>
                    {row.role?.name || "N/A"}
                  </StyledTableCell>
                  <StyledTableCell>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString()
                      : "N/A"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                    >
                      {hasPermission("Member", "delete") && (
                        <MenuItem onClick={() => deleteHandler(row.id)}>
                          <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
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

      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" mt={6}>
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
