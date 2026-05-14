
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
import Breaker from "../../compoents/Breaker";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Loader from "../../compoents/Loader";
import LoderBtn from "../../compoents/LoderBtn";
import { Modal } from "antd";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import toast from "react-hot-toast";
import xlsx from "json-as-xlsx";
import { useAuth } from "../../auth/AuthContext";
import { getAllDrivers } from "../../Services/DriverApi";
import { Select } from "antd";
const { Option } = Select;
import {
  getAllVehicles,
  deleteVehicle, assignDriverToVehicle
} from "../../Services/VehicleApi";
// import { assignDriver } from "../../Services/BookingApi";
import { reassignCancelRequestApi } from "../../Services/RequestApi";

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
  "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
  "&:hover": { backgroundColor: "#f1f5f9", transition: "background-color 0.2s ease" },
  "&:last-child td, &:last-child th": { border: 0 },
}));

export default function VehicleList() {
  const { auth, hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [stats, setStats] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [searchDriver, setSearchDriver] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllVehicles({
        page,
        limit: rowsPerPage,
        search: searchQuery.trim(),
      });

      if (result?.status) {
        const transformed = (result.data || []).map(item => ({
          ...item,
          id: item._id,
        }));
        setData(transformed);
        setTotalPages(result.totalPage || 1);
        setTotalRecord(result.totalResult || 0);
        setStats(result.stats || null);
      } else {
        toast.error(result?.message || "Failed to load vehicles");
      }
    } catch (error) {
      console.error("Fetch vehicles error:", error);
      toast.error("Could not fetch vehicles");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    if (!authLoading.profile && auth.user) {
      fetchData();
    }
  }, [fetchData, authLoading.profile, auth.user]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => setPage(newPage);

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
      title: "Delete Vehicle",
      content: "Are you sure? This action cannot be undone.",
      okText: loading ? "Deleting..." : "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { disabled: loading },
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteVehicle(id);
          if (res?.status) {
            toast.success("Vehicle deleted successfully");
            fetchData();
          } else {
            toast.error(res?.message || "Delete failed");
          }
        } catch (err) {
          toast.error("Error while deleting vehicle");
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
      navigate("create");
      setIsLoading(false);
    }, 300);
  };

  const exportFunc = async (vehiclesData) => {
    if (!vehiclesData?.length) return toast.error("No vehicles to export");

    setIsExporting(true);
    const settings = {
      fileName: "Mann_Fleet_Vehicles",
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    const data = [{
      sheet: "Vehicles",
      columns: [
        { label: "ID", value: row => row?._id || "" },
        { label: "Car Number", value: row => row?.carNumber || "" },
        { label: "Brand", value: row => row?.brand || "" },
        { label: "Model", value: row => row?.model || "" },
        { label: "Driver Name", value: row => row?.driver?.name || "N/A" },
        { label: "Driver Phone", value: row => row?.driver?.phone || "N/A" },
        { label: "Color", value: row => row?.color || "" },
        { label: "Fuel Type", value: row => row?.fuelType || "" },
        { label: "Status", value: row => row?.isActive ? "Active" : "Inactive" },
        { label: "Created At", value: row => row?.createdAt ? new Date(row.createdAt).toLocaleString() : "" },
      ],
      content: vehiclesData,
    }];

    try {
      xlsx(data, settings);
      toast.success("Exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const openAssignModal = (row) => {
    setSelectedVehicle(row);
    setSelectedDriver(row?.driver?._id || "");
     setSearchDriver(""); 
    setAssignModal(true);
  };

  // const handleAssignSubmit = async () => {
  //   if (!selectedDriver) {
  //     toast.error("Please select driver");
  //     return;
  //   }

  //   try {
  //     setAssignLoading(true);

  //     let res;

  //     if (selectedVehicle?.driver) {
  //       // 🔁 REASSIGN
  //       res = await reassignCancelRequestApi(selectedVehicle.id, selectedDriver);
  //     } else {
  //       // ➕ ASSIGN
  //       res = await assignDriverToVehicle(selectedVehicle.id, selectedDriver);
  //     }

  //     if (res?.status) {
  //       toast.success(selectedVehicle?.driver ? "Driver reassigned" : "Driver assigned");
  //       setAssignModal(false);
  //       fetchData(); // refresh table
  //     } else {
  //       toast.error(res?.message || "Failed");
  //     }
  //   } catch (err) {
  //     toast.error("Something went wrong");
  //   } finally {
  //     setAssignLoading(false);
  //   }
  // };

  const handleAssignSubmit = async () => {
  if (!selectedDriver) {
    toast.error("Please select driver");
    return;
  }

  try {
    setAssignLoading(true);

    const res = await assignDriverToVehicle(
      selectedVehicle._id,
      selectedDriver
    );

    if (res?.status) {
      toast.success(
        selectedVehicle?.driver
          ? "Driver reassigned"
          : "Driver assigned"
      );

      setAssignModal(false);
      fetchData();
    } else {
      toast.error(res?.message || "Failed");
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setAssignLoading(false);
  }
};

  const fetchDrivers = useCallback(async (search) => {
    setDriversLoading(true);
    try {
      const res = await getAllDrivers({
        page: 1,
        rowsPerPage: 50,
        searchQuery: search || "",
      });

      if (res?.status) {
        setDrivers(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  }, []);

  useEffect(() => {
    if (assignModal) {
      fetchDrivers(searchDriver);
    }
  }, [assignModal, searchDriver, fetchDrivers]);

  if (authLoading.profile) return <Loader />;
  if (!auth.user) {
    navigate("/login");
    return null;
  }
  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6"><Breaker />

        {stats && (
          <div className="flex justify-end mb-2">
            <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white shadow-md rounded-lg px-4 py-2 text-sm flex items-center gap-3">

              <span>
                <span className="opacity-80">Total:</span>{" "}
                <span className="font-semibold">{stats.total}</span>
              </span>

              <span className="opacity-50">|</span>

              <span>
                <span className="opacity-80">On Trip:</span>{" "}
                <span className="font-semibold text-yellow-300">
                  {stats.onTripCount}
                </span>
              </span>

              <span className="opacity-50">|</span>

              <span>
                <span className="opacity-80">Available:</span>{" "}
                <span className="font-semibold text-green-300">
                  {stats.availableCount}
                </span>
              </span>

              <span className="opacity-50">|</span>

              <span>
                <span className="opacity-80">Inactive:</span>{" "}
                <span className="font-semibold text-red-300">
                  {stats.inactiveCount}
                </span>
              </span>


              <span className="opacity-50">|</span>

              <span>
                <span className="opacity-80">Active:</span>{" "}
                <span className="font-semibold text-green-300">
                  {stats.activeCount}
                </span>
              </span>

            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Management</h1>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Vehicle number or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </motion.button>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => exportFunc(data)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-green-700"
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <LoderBtn /> Exporting...
                </span>
              ) : (
                "Export Excel"
              )}
            </motion.button>

            {hasPermission("Vehicle", "create") && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="bg-primary text-white px-5 py-2 rounded-lg font-medium shadow hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoderBtn /> Adding...
                  </span>
                ) : (
                  "Add Vehicle"
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <TableContainer component={Paper} className="rounded-xl shadow-lg overflow-hidden">
        <Table sx={{ minWidth: 1000 }} aria-label="vehicle table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No.</StyledTableCell>
              <StyledTableCell>Vehicle Image</StyledTableCell>
              <StyledTableCell>Information</StyledTableCell>
              <StyledTableCell>Capacity<br></br><span>(Seater)</span> </StyledTableCell>
              <StyledTableCell>Fuel Type</StyledTableCell>
              <StyledTableCell>Chauffeur</StyledTableCell>
              <StyledTableCell>Trip</StyledTableCell>
              <StyledTableCell>Segment</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={8} align="center" className="py-12 text-gray-500 text-lg">
                  No vehicles found
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>

                  {/* Car Image */}
                  <StyledTableCell>
                    {row.carImage && row.carImage.length > 0 ? (
                      <img
                        src={row.carImage[0]}
                        alt={`${row.brand} ${row.model}`}
                        className="h-14 w-20 object-cover rounded-md border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // ✅ STOP LOOP
                          e.currentTarget.src = "/assets/placeholder-car.png";
                        }}
                      />
                    ) : (
                      <div className="h-14 w-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </StyledTableCell>

                  {/* Information */}
                  <StyledTableCell>
                    {row.carNumber || "—"}<br />
                    <span className="text-xs text-gray-500">
                      {row.model || "—"}
                    </span><br></br>
                    <span className="text-xs text-gray-500">
                      {row.brand || "—"}
                    </span>
                  </StyledTableCell>

                  {/* Capacity */}
                  <StyledTableCell>{row.capacity || "—"}</StyledTableCell>

                  {/* Fuel */}
                  <StyledTableCell className="capitalize">{row.fuelType || "—"}</StyledTableCell>

                  {/* DRIVER */}
                  {/* <StyledTableCell>
                    {row.driver?.name || "—"}<br />
                    <span className="text-xs text-gray-500">
                      {row.driver?.phone || "—"}<br />
                      {row.driver?.licenseNumber || "—"}
                    </span>
                  </StyledTableCell> */}

                  <StyledTableCell>
                    {row.driver ? (
                      <>
                        {row.driver.name}<br />
                        <span className="text-xs text-gray-500">
                          {row.driver.phone}<br />
                          {row.driver.licenseNumber}
                        </span>
                         <br></br>
                        <button
                          onClick={() => openAssignModal(row)}
                          className="mt-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Reassign
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 text-sm">No Driver</span><br />

                        <button
                          onClick={() => openAssignModal(row)}
                          className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Assign
                        </button>
                      </>
                    )}
                  </StyledTableCell>

                  {/* TRIP */}
                  <StyledTableCell>
                    <MenuItem
                      onClick={() => { navigate(`vehicleBooking/${row.id}`); handleMenuClose(); }}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <EyeIcon className="h-5 w-5 text-blue-600" />View
                    </MenuItem>
                  </StyledTableCell>

                  {/* Segment */}
                  <StyledTableCell>
                    {row.segment?.name || "—"}
                  </StyledTableCell>
                  {/* <StyledTableCell>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${row.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </StyledTableCell> */}



                  {/* Actions */}
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
                      PaperProps={{ sx: { minWidth: 140 } }}
                    >
                      {hasPermission("Vehicle", "read") && (
                        <MenuItem
                          onClick={() => { navigate(`vehicledetails/${row.id}`); handleMenuClose(); }}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <EyeIcon className="h-5 w-5 text-blue-600" />View
                        </MenuItem>
                      )}
                      {hasPermission("Vehicle", "update") && (
                        <MenuItem
                          onClick={() => { navigate(`updateVehicle/${row.id}`); handleMenuClose(); }}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <PencilIcon className="h-5 w-5 text-green-600" /> Edit
                        </MenuItem>
                      )}
                      {hasPermission("Vehicle", "delete") && (
                        <MenuItem
                          onClick={() => deleteHandler(row.id)}
                          className="flex items-center gap-2 text-gray-700"
                        >
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

      <Modal
        title={selectedVehicle?.driver ? "Reassign Chauffeur" : "Assign Chauffeur"}
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        onOk={handleAssignSubmit}
        confirmLoading={assignLoading}
      >
        <Select
          showSearch
          placeholder="Select Chauffeur"
          value={selectedDriver || undefined}
          className="w-full"
          onChange={(val) => setSelectedDriver(val)}
          onSearch={(val) => setSearchDriver(val)}
          loading={driversLoading}
          filterOption={false} // 🔥 IMPORTANT (API search)
        >
          {drivers.map((d) => (
            <Option key={d._id} value={d._id}>
              {`${d.name} | ${d.phone}`}
            </Option>
          ))}
        </Select>
      </Modal>

      {totalRecord > 0 && (
        <Stack spacing={2} alignItems="center" marginTop={6}>
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