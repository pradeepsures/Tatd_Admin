import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Breaker from '../../compoents/Breaker'; // Fixed typo: compoents -> compoents
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import Loader from '../../compoents/Loader'; // Fixed typo
import LoderBtn from '../../compoents/LoderBtn'; // Fixed typo
import { getAllRoleApi, RoleDelete } from '../../Services/RoleApi'; // Fixed BannerDelete -> SpecialityDelete
import { Button, Modal } from 'antd';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import toast from 'react-hot-toast';
import xlsx from 'json-as-xlsx';
import { useAuth } from "../../auth/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    // background: "linear-gradient(to right, #5F0099, #9F00FF)",
    background: "linear-gradient(90deg, #03045E 0%, #0077B6 50%, #00B4D8 100%)",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '12px 16px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.9rem',
    color: '#374151',
    padding: '12px 16px',
  },
}));

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

export default function skillList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const navigate = useNavigate();
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllRoleApi({ page, rowsPerPage, searchQuery });
      if (result?.status) {
        toast.success('role fetched successfully!');
        const transformedData = (result.data.roles || []).map(item => ({
          ...item,
          id: item._id,
        }));
        setData(transformedData);
        setTotalPages(result.totalPages || 0);
        setTotalRecord(result.totalRoles || 0);
      } else {
        toast.error(result?.message || 'Failed to fetch role.');
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      toast.error('Error fetching role.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
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
      title: 'Delete role',
      content: 'Are you sure you want to delete this role? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const result = await RoleDelete(id);
          if (result?.status) {
            toast.success('role deleted successfully!');
            fetchData(); // Refetch data instead of filtering locally
          } else {
            toast.error(result?.message || 'Failed to delete role.');
          }
        } catch (error) {
          console.error('Error deleting role:', error);
          toast.error('Error deleting role.');
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
      navigate('createrole');
      setIsLoading(false);
    }, 300);
  };
  //this is the code for exporting the data fo excel
  const exportFunc = async (allLeadsData) => {
    if (allLeadsData.length < 1) {
      return toast.error('role list is empty!');
    }
    setIsExporting(true);
    const settings = {
      fileName: 'Astro_Kashi_role',
      extraLength: 3,
      writeMode: 'writeFile',
      writeOptions: {},
      RTL: false,
    };
    const data = [
      {
        sheet: 'role List',
        columns: [
          { label: 'ID', value: (row) => row?._id || '' },
          { label: 'Name', value: (row) => row?.name || '' },
          { label: 'Status', value: (row) => row?.status ? 'Active' : 'Inactive' },
          {
            label: 'Created Date',
            value: (row) => row?.createdAt ? new Date(row.createdAt).toLocaleString() : '',
          },
        ],
        content: allLeadsData,
      },
    ];
    try {
      xlsx(data, settings);
      toast.success('Exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel.');
    } finally {
      setIsExporting(false);
    }
  };


  if (!auth?.user) {
    navigate("/login");
    return null;
  }

  // if (!hasPermission("Role", "view")) {
  //   return (
  //     <div className="text-center mt-20 text-red-500 text-lg">
  //       You don’t have permission to view this page
  //     </div>
  //   );
  // }

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
            placeholder="Search role by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={() => {
              setSearchQuery(search);
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
            onClick={() => exportFunc(data)}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-green-700 transition-colors"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <LoderBtn />
                Exporting...
              </span>
            ) : (
              'Export Excel'
            )}
          </motion.button>
          {hasPermission("Role", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              data-aos="fade-left"
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition-shadow"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoderBtn />
                  Add Role
                </span>
              ) : (
                "Add Role"
              )}
            </motion.button>
          )}
          {/* <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            data-aos="fade-left"
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition-shadow"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoderBtn />
                Add Role
              </span>
            ) : (
              'Add Role'
            )}
          </motion.button> */}
        </div>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table sx={{ minWidth: 700 }} aria-label="speciality table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              {/* <StyledTableCell>Status</StyledTableCell> */}
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={4} align="center" className="py-8 text-gray-500 text-lg">
                  No specialities found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>
                  <StyledTableCell className="font-medium text-gray-800">{row.name || 'N/A'}</StyledTableCell>
                  {/* <StyledTableCell>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        row.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.status ? 'Active' : 'Inactive'}
                    </span>
                  </StyledTableCell> */}
                  <StyledTableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, row.id)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={`Actions for ${row.name}`}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleMenuClose}
                      PaperProps={{
                        className: 'shadow-lg rounded-lg',
                      }}
                    >

                      {/* <MenuItem
                        onClick={() => {
                          navigate(`updaterole/${row.id}`);
                          handleMenuClose();
                        }}
                        className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                      >
                        <PencilIcon className="h-5 w-5 text-green-600" />
                        Edit
                      </MenuItem> */}
                      {hasPermission("Role", "update") && (
                        <MenuItem
                          onClick={() => {
                            navigate(`updaterole/${row.id}`);
                            handleMenuClose();
                          }}
                        >
                          <PencilIcon className="h-5 w-5 text-green-600" />
                          Edit
                        </MenuItem>
                      )}
                      {/* <MenuItem
                        onClick={() => deleteHandler(row.id)}
                        className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                        Delete
                      </MenuItem> */}
                      {hasPermission("Role", "delete") && (
                        <MenuItem onClick={() => deleteHandler(row.id)}>
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

      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            className=" rounded-lg p-2"
            boundaryCount={1}
            siblingCount={1}
          />
        </Stack>
      )}
    </div>
  );
}