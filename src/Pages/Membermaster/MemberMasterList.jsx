import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
import Breaker from "../../compoents/Breaker";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { useAuth } from "../../auth/AuthContext";
import {
    getAllSectionName,
    createSectionNameApi,
    updateSectionNameApi,
    deleteSectionNameApi,
    getSectionNameById,
} from "../../Services/MemberMasterApi";
import { Modal, Form, Input, Button } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        background: "linear-gradient(to right, #03045E, #023E8A, #0077B6)",
        color: theme.palette.common.white,
        fontWeight: 600,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: "0.9rem",
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
    "&:hover": { backgroundColor: "#f1f5f9" },
}));

export default function SectionNameList() {
    const { auth, hasPermission, loading: authLoading } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const [isExporting, setIsExporting] = useState(false);

    // ================= FETCH =================
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getAllSectionName({
                page,
                rowsPerPage,
                searchQuery,
            });

            if (res?.status) {
                const formatted = res.data.map((item) => ({
                    ...item,
                    id: item._id,
                }));

                setData(formatted);
                setTotalPages(res.totalPage || 1);
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    // ================= SEARCH =================
    const handleSearch = () => {
        setSearchQuery(search.trim());
        setPage(1);
    };

    // ================= ACTION MENU =================
    const handleMenuOpen = (e, id) => {
        setAnchorEl(e.currentTarget);
        setSelectedRowId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRowId(null);
    };

    // ================= DELETE =================
    const deleteHandler = (id) => {
        Modal.confirm({
            title: "Delete Section",
            content: "Are you sure?",
            onOk: async () => {
                const res = await deleteSectionNameApi(id);
                if (res?.status) {
                    toast.success("Deleted");
                    fetchData();
                } else {
                    toast.error(res.message);
                }
            },
        });
        handleMenuClose();
    };

    // ================= CREATE =================
    const handleCreate = async (values) => {
        const res = await createSectionNameApi(values);
        if (res?.status) {
            toast.success("Created");
            createForm.resetFields();
            setCreateModalVisible(false);

            fetchData();
        } else {
            toast.error(res.message);
        }
    };

    const openCreateModal = () => {
        createForm.resetFields();   // ✅ IMPORTANT
        setCreateModalVisible(true);
    };

    // ================= EDIT =================
    const openEditModal = async (id) => {
        const res = await getSectionNameById(id);
        if (res?.status) {
            setEditingData(res.data);
            editForm.setFieldsValue(res.data);
            setEditModalVisible(true);
        }
        handleMenuClose();
    };

    const handleUpdate = async (values) => {
        const res = await updateSectionNameApi({
            id: editingData._id,
            data: values,
        });

        if (res?.status) {
            toast.success("Updated");
            setEditModalVisible(false);
            fetchData();
        } else {
            toast.error(res.message);
        }
    };

    // ================= EXPORT =================
    const exportExcel = () => {
        if (!data.length) return toast.error("No data");

        setIsExporting(true);

        const sheet = [
            {
                sheet: "SectionName",
                columns: [
                    { label: "ID", value: "_id" },
                    { label: "Name", value: "name" },
                ],
                content: data,
            },
        ];

        xlsx(sheet);
        setIsExporting(false);
    };

    if (authLoading.profile) return <Loader />;
    if (!auth.user) {
        return null;
    }

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="flex justify-between mb-6">
                <div className="flex gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search section..."
                        className="border px-4 py-2 rounded-lg w-80"
                    />

                    <button onClick={handleSearch} className="bg-blue-600 text-white px-4 rounded">
                        Search
                    </button>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportExcel} className="bg-green-600 text-white px-4 rounded">
                        {isExporting ? "Exporting..." : "Export"}
                    </button>

                    {/* <button
                        onClick={openCreateModal}
                        className="bg-blue-800 text-white px-4 rounded"
                    >
                        Add Section
                    </button> */}

                    {hasPermission("SectionMaster", "create") && (
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-800 text-white px-4 rounded"
                        >
                            Add Section
                        </button>
                    )}


                </div>
            </div>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.No</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Created</StyledTableCell>
                            <StyledTableCell align="center">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, i) => (
                            <StyledTableRow key={row.id}>
                                <StyledTableCell>{i + 1}</StyledTableCell>
                                <StyledTableCell>{row.name}</StyledTableCell>
                                <StyledTableCell>
                                    {new Date(row.createdAt).toLocaleDateString()}
                                </StyledTableCell>

                                <StyledTableCell align="center">
                                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}>
                                        <MoreVertIcon />
                                    </IconButton>

                                    <Menu
                                        anchorEl={anchorEl}
                                        open={selectedRowId === row.id}
                                        onClose={handleMenuClose}
                                    >
                                        {hasPermission("SectionMaster", "update") && (
                                            <MenuItem onClick={() => openEditModal(row.id)}>
                                                <PencilIcon className="h-4 w-4 mr-2" /> Edit
                                            </MenuItem>
                                        )}

                                        {hasPermission("SectionMaster", "delete") && (
                                            <MenuItem onClick={() => deleteHandler(row.id)}>
                                                <TrashIcon className="h-4 w-4 mr-2 text-red-500" /> Delete
                                            </MenuItem>
                                        )}
                                        {/* <MenuItem onClick={() => openEditModal(row.id)}>
                                            <PencilIcon className="h-4 w-4 mr-2" /> Edit
                                        </MenuItem>

                                        <MenuItem onClick={() => deleteHandler(row.id)}>
                                            <TrashIcon className="h-4 w-4 mr-2 text-red-500" /> Delete
                                        </MenuItem> */}
                                    </Menu>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack mt={4} alignItems="center">
                <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
            </Stack>

            {/* Create Modal */}
            <Modal open={createModalVisible} footer={null}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();   // ✅ cleanup
                }}>
                <Form form={createForm} onFinish={handleCreate} layout="vertical">
                    <Form.Item name="name" label="Section Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Button htmlType="submit" type="primary" block>
                        Create
                    </Button>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal open={editModalVisible} footer={null} onCancel={() => setEditModalVisible(false)}>
                <Form form={editForm} onFinish={handleUpdate} layout="vertical">
                    <Form.Item name="name" label="Section Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Button htmlType="submit" type="primary" block>
                        Update
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}