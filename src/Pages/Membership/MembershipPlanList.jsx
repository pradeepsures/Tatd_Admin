import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { getMembershipPlans, deleteMembershipPlan } from "../../Services/MembershipPlanApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "12px 16px",
    textTransform: "uppercase",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.9rem",
    color: "#374151",
    padding: "12px 16px",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f9fafb",
  },
  "&:hover": {
    backgroundColor: "#f1f5f9",
    transition: "background-color 0.2s ease",
  },
}));

export default function MembershipPlanList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMembershipPlans();
      if (result?.status) {
        setData(result.data || []);
      } else {
        toast.error(result?.message || "Failed to load membership plans");
      }
    } catch (error) {
      toast.error("Error loading plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      title: "Delete Membership Plan",
      content: "Are you sure you want to delete this plan? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteMembershipPlan(id);
          if (res?.status) {
            toast.success("Membership plan deleted successfully!");
            fetchData();
          } else {
            toast.error(res?.message || "Delete failed");
          }
        } catch (err) {
          toast.error("Error deleting plan");
        } finally {
          setLoading(false);
        }
      },
    });
    handleMenuClose();
  };

  const handleEdit = (id) => {
    handleMenuClose();
    navigate(`/home/membership/update/${id}`);
  };

  const filteredData = data.filter((item) =>
    item.planName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Breaker />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Search by plan name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => navigate("/home/membership/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow transition-colors"
        >
          + Add Membership Plan
        </button>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Plan Name</StyledTableCell>
              <StyledTableCell>Cycle & Tier</StyledTableCell>
              <StyledTableCell>Price</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
                  No membership plans found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              filteredData.map((row, index) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>
                    {row.image ? (
                      <img src={row.image} alt={row.planName} className="h-12 w-12 object-cover rounded shadow" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-medium text-gray-800">{row.planName}</div>
                    {row.tag && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">{row.tag}</span>}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div>{row.billingCycle}</div>
                    <div className="text-xs text-gray-500">{row.tier} Tier</div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-medium">₹{row.price}</div>
                    {row.originalPrice && <div className="text-xs text-red-500 line-through">₹{row.originalPrice}</div>}
                    {row.savingsText && <div className="text-xs text-green-600">{row.savingsText}</div>}
                  </StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        row.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row._id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row._id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleEdit(row._id)}>
                        <PencilIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => deleteHandler(row._id)}>
                        <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                        Delete
                      </MenuItem>
                    </Menu>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
