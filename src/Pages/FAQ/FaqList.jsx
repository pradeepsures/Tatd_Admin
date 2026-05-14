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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { getAllFaqs, deleteFaq } from "../../Services/FaqApi"; // ✅ implement these API functions
import { Modal } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import { Select } from "antd";
const { Option } = Select;

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

export default function FaqList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllFaqs({ page, rowsPerPage, searchQuery, lang: selectedLanguage });
      if (result?.status) {
        toast.success("FAQs fetched successfully!");
        const transformedData = (result.data || []).map((item) => ({
          ...item,
          id: item._id,
        }));
        setData(transformedData);
        setTotalPages(result.totalPage || 0);
        setTotalRecord(result.totalResult || 0);
      } else {
        toast.error(result?.message || "Failed to fetch FAQs.");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Error fetching FAQs.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, selectedLanguage]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading.profile, auth.user]);

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
      title: "Delete FAQ",
      content: "Are you sure you want to delete this FAQ?",
      okText: loading ? "Deleting..." : "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { disabled: loading },
      onOk: async () => {
        try {
          setLoading(true);
          const result = await deleteFaq(id);
          if (result?.status) {
            toast.success("FAQ deleted successfully!");
            fetchData();
          } else {
            toast.error(result?.message || "Failed to delete FAQ.");
          }
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          toast.error("Error deleting FAQ.");
        } finally {
          setLoading(false);
        }
      },
    });
    handleMenuClose();
  };

  const exportFunc = async (allFaqData) => {
    if (allFaqData.length < 1) {
      return toast.error("FAQ list is empty!");
    }
    setIsExporting(true);
    const settings = {
      fileName: "Mann_FAQs",
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };
    const dataToExport = [
      {
        sheet: "FAQ List",
        columns: [
          { label: "ID", value: (row) => row?._id || "" },
          { label: "Question", value: (row) => row?.question || "" },
          { label: "Answer", value: (row) => row?.answer || "" },
          { label: "Type", value: (row) => row?.type || "" },
          {
            label: "Created Date",
            value: (row) =>
              row?.createdAt ? new Date(row.createdAt).toLocaleString() : "",
          },
        ],
        content: allFaqData,
      },
    ];
    try {
      xlsx(dataToExport, settings);
      toast.success("Exported to Excel successfully!");
    } catch (error) {
      console.error("Error exporting FAQs:", error);
      toast.error("Failed to export FAQs.");
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading.profile) return <Loader />;

  // if (!auth.user) {
  //   navigate("/login");
  //   return null;
  // }
  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 placeholder-gray-400"
            aria-label="Search FAQs"
          />
          <button
            onClick={() => {
              setSearchQuery(search);
              setPage(1);
            }}
            className="bg-primary text-white  px-5 py-2.5 rounded-lg font-medium"
          >
            Search
          </button>
        </div>
        <div className="flex gap-4">
{/* 
          <Select
            value={selectedLanguage}
            onChange={(value) => {
              setSelectedLanguage(value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <Option value="en">English</Option>
            <Option value="hi">Hindi</Option>
            <Option value="pa">Punjabi</Option>
            <Option value="bn">Bengali</Option>
            <Option value="ta">Tamil</Option>
            <Option value="te">Telugu</Option>
            <Option value="gu">Gujarati</Option>
            <Option value="mr">Marathi</Option>
          </Select> */}

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
              "Export Excel"
            )}
          </motion.button>
          {hasPermission("FAQ", "create") && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("createfaq")}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition-shadow"
            >
              Add FAQ
            </motion.button>
          )}
        </div>
      </div>

      <TableContainer
        component={Paper}
        className="rounded-xl shadow-lg overflow-hidden"
      >
        <Table sx={{ minWidth: 700 }} aria-label="faq table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Question</StyledTableCell>
              <StyledTableCell>Answer</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Created Date</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={6}
                  align="center"
                  className="py-8 text-gray-500 text-lg"
                >
                  No FAQs found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    {(page - 1) * rowsPerPage + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>{row.question}</StyledTableCell>
                  <StyledTableCell>{row.answer}</StyledTableCell>
                  <StyledTableCell className="capitalize">
                    {row.type}
                  </StyledTableCell>
                  <StyledTableCell className="text-gray-600">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A"}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {(hasPermission("FAQ", "read") ||
                      hasPermission("FAQ", "update") ||
                      hasPermission("FAQ", "delete")) && (
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
                      {hasPermission("FAQ", "read") && (
                        <MenuItem
                          onClick={() => {
                            navigate(`viewfaq/${row.id}`);
                            handleMenuClose();
                          }}
                          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                        >
                          <EyeIcon className="h-5 w-5 text-blue-600" />
                          View
                        </MenuItem>
                      )}
                      {hasPermission("FAQ", "update") && (
                        <MenuItem
                          onClick={() => {
                            navigate(`updatefaq/${row.id}`);
                            handleMenuClose();
                          }}
                          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                        >
                          <PencilIcon className="h-5 w-5 text-green-600" />
                          Edit
                        </MenuItem>
                      )}
                      {hasPermission("FAQ", "delete") && (
                        <MenuItem
                          onClick={() => deleteHandler(row.id)}
                          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
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

      {totalRecord > rowsPerPage && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            className="rounded-lg p-2"
            boundaryCount={1}
            siblingCount={1}
          />
        </Stack>
      )}
    </div>
  );
}
