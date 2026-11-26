import * as React from "react";
import useAdminListState from "../../hooks/useAdminListState";
import { useEffect, useState, useCallback } from "react";
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

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Modal, Form, Input, Button, TimePicker } from "antd";

import dayjs from "dayjs";
import toast from "react-hot-toast";

import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

import {
  getAllNightTimes,
  getNightTimeById,
  createNightTimeApi,
  updateNightTimeApi,
  deleteNightTime,
} from "../../Services/NightTimeApi";

// ───────────────────────────────
// TABLE STYLE
// ───────────────────────────────
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
    backgroundColor: "rgba(248,250,252,0.45)",
  },
  "&:hover": {
    backgroundColor: "rgba(16,24,40,0.08)",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function NightTimesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useAdminListState("page", 1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [editingNightTime, setEditingNightTime] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // ───────────────────────────────
  // FETCH DATA
  // ───────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllNightTimes({
        page,
        rowsPerPage,
      });

      if (res?.status) {
        setData((res.data || []).map((i) => ({ ...i, id: i._id })));
        setTotalPages(res.totalPage || 1);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ───────────────────────────────
  // MENU
  // ───────────────────────────────
  const openMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  // ───────────────────────────────
  // CREATE
  // ───────────────────────────────
  const handleCreate = async (values) => {
    try {
      await createNightTimeApi({
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      });

      setCreateModal(false);
      createForm.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // ───────────────────────────────
  // EDIT
  // ───────────────────────────────
  const openEdit = async (id) => {
    try {
      const res = await getNightTimeById(id);

      if (res?.status) {
        setEditingNightTime(res.data);

        editForm.setFieldsValue({
          startTime: dayjs(res.data.startTime, "HH:mm"),
          endTime: dayjs(res.data.endTime, "HH:mm"),
        });

        setEditModal(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async (values) => {
    try {
      await updateNightTimeApi(editingNightTime._id, {
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      });

      setEditModal(false);

      editForm.resetFields();

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // ───────────────────────────────
  // DELETE
  // ───────────────────────────────
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Night Time",
      content: "Are you sure?",
      okType: "danger",

      onOk: async () => {
        await deleteNightTime(id);
        fetchData();
      },
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="page-shell">
      <Breaker />

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Night Times
          </h1>
        </div>

        <div className="page-actions">
          <button
            onClick={() => setCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TableContainer component={Paper} className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Start Time</StyledTableCell>
              <StyledTableCell>End Time</StyledTableCell>
              <StyledTableCell>Created</StyledTableCell>
              <StyledTableCell align="center">
                Action
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, i) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell>
                  {(page - 1) * rowsPerPage + i + 1}
                </StyledTableCell>

                <StyledTableCell className="!font-semibold !text-slate-900">
                  {row.startTime}
                </StyledTableCell>

                <StyledTableCell className="!font-semibold !text-slate-900">
                  {row.endTime}
                </StyledTableCell>

                <StyledTableCell>
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "N/A"}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton
                    onClick={(e) => openMenu(e, row.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={menuId === row.id}
                    onClose={closeMenu}
                  >
                    <MenuItem
                      onClick={() => {
                        openEdit(row.id);
                        closeMenu();
                      }}
                    >
                      <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                      Edit
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleDelete(row.id);
                        closeMenu();
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-red-600 mr-2" />
                      Delete
                    </MenuItem>
                  </Menu>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Stack alignItems="center" mt={1}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
        />
      </Stack>

      {/* CREATE MODAL */}
      <Modal
        open={createModal}
        onCancel={() => {
          setCreateModal(false);
          createForm.resetFields();
        }}
        footer={null}
        title="Create Night Time"
      >
        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
        >
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[
              {
                required: true,
                message: "Please select start time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[
              {
                required: true,
                message: "Please select end time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 h-11 w-full !rounded-xl"
          >
            Create
          </Button>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={editModal}
        onCancel={() => {
          setEditModal(false);
          editForm.resetFields();
        }}
        footer={null}
        title="Update Night Time"
      >
        <Form
          form={editForm}
          onFinish={handleUpdate}
          layout="vertical"
        >
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[
              {
                required: true,
                message: "Please select start time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[
              {
                required: true,
                message: "Please select end time",
              },
            ]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 h-11 w-full !rounded-xl"
          >
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}