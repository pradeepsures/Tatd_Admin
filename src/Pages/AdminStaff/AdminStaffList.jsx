import * as React from 'react';
import useAdminListState from "../../hooks/useAdminListState";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Breaker from '../../compoents/Breaker';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import Loader from '../../compoents/Loader';
import LoderBtn from '../../compoents/LoderBtn';
import { getAllMember, MemberDelete } from '../../Services/MemberApi';
import { Modal } from 'antd';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import toast from 'react-hot-toast';
import { useAuth } from "../../auth/AuthContext";
import { StyledTableCell } from '../../compoents/TableComponents';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f9fafb',
  },
  '&:hover': {
    backgroundColor: '#f1f5f9',
    transition: 'background-color 0.2s ease',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function AdminStaffList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchQuery, setSearchQuery] = useAdminListState("searchQuery", '');
  const [page, setPage] = useAdminListState("page", 1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [search, setSearch] = useAdminListState("search", '');
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const navigate = useNavigate();
  const { auth, hasPermission } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllMember({ page, rowsPerPage, search: searchQuery });
      if (result?.status) {
        toast.success('Staff members fetched successfully!');
        const transformedData = (result.data?.user || []).map(item => ({
          ...item,
          id: item._id,
        }));
        setData(transformedData);
        setTotalPages(result.totalPage || 0);
        setTotalRecord(result.totalResult || 0);
      } else {
        toast.error(result?.message || 'Failed to fetch staff members.');
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Error fetching staff members.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      title: 'Delete Staff Member',
      content: 'Are you sure you want to delete this member? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const result = await MemberDelete(id);
          if (result?.status) {
            toast.success('Staff member deleted successfully!');
            fetchData();
          } else {
            toast.error(result?.message || 'Failed to delete staff member.');
          }
        } catch (error) {
          console.error('Error deleting staff member:', error);
          toast.error('Error deleting staff member.');
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
      navigate('create');
      setIsLoading(false);
    }, 300);
  };

  if (!auth?.user) {
    navigate("/login");
    return null;
  }

  if (!hasPermission("AdminStaff", "read")) {
    return (
      <div className="text-center mt-20 text-red-500 text-lg">
        You don’t have permission to view this page
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Staff</h1>
          <p className="page-subtitle">{totalRecord} record{totalRecord === 1 ? "" : "s"} found</p>
        </div>
        <div className="page-actions">
          {hasPermission("AdminStaff", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              data-aos="fade-left"
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn />
                  Add Staff
                </span>
              ) : (
                "Add Staff"
              )}
            </motion.button>
          )}
        </div>
      </div>

      <div className="card card-pad">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-field w-full"
          />
          </div>
          <button
            onClick={() => {
              setSearchQuery(search);
              setPage(1);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </div>

      <TableContainer component={Paper} className="overflow-hidden">
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center" className="!py-14 !text-slate-400">
                  No staff members found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>
                  <StyledTableCell className="!font-semibold !text-slate-800">{row.userName || 'N/A'}</StyledTableCell>
                  <StyledTableCell>{row.email || 'N/A'}</StyledTableCell>
                  <StyledTableCell>
                    <span className="badge-info">
                      {row.role?.name || 'No Role Assigned'}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, row.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                      PaperProps={{ className: 'shadow-lg rounded-lg' }}
                    >
                      {hasPermission("AdminStaff", "delete") && (
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
        <Stack spacing={2} alignItems="center" marginTop={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            className="rounded-lg p-2"
          />
        </Stack>
      )}
    </div>
  );
}
