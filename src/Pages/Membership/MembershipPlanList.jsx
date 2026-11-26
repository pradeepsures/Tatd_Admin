import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
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
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { getMembershipPlans, deleteMembershipPlan } from "../../Services/MembershipPlanApi";

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

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(248,250,252,0.6)",
  },
  "&:hover": {
    backgroundColor: "rgba(16,24,40,0.08)",
    transition: "background-color 0.2s ease",
  },
}));

export default function MembershipPlanList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useAdminListState("search", "");

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
    <div className="page-shell">
      <Breaker />

      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
        </div>
        <div className="page-actions">
          <button
            onClick={() => navigate("/home/membership/create")}
            className="btn-primary w-full sm:w-auto"
          >
            + Add Membership Plan
          </button>
        </div>
      </div>

      <div className="card card-pad">
        <div className="relative w-full sm:w-96">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by plan name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-field w-full"
          />
        </div>
      </div>

      <TableContainer component={Paper} className="overflow-hidden">
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
                <StyledTableCell colSpan={7} align="center" className="!py-14 !text-slate-400">
                  No membership plans found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              filteredData.map((row, index) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>
                    {row.image ? (
                      <img src={row.image} alt={row.planName} className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-black/5" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 ring-1 ring-black/5">N/A</div>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-semibold text-slate-900">{row.planName}</div>
                    {row.tag && <span className="badge-warning mt-1">{row.tag}</span>}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div>{row.billingCycle}</div>
                    <div className="text-xs text-slate-500">{row.tier} Tier</div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="font-semibold text-slate-900">₹{row.price}</div>
                    {row.originalPrice && <div className="text-xs text-slate-400 line-through">₹{row.originalPrice}</div>}
                    {row.savingsText && <div className="text-xs font-medium text-emerald-600">{row.savingsText}</div>}
                  </StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={
                        row.status ? "badge-success" : "badge-danger"
                      }
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
