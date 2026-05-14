import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProfileView from "./ProfileView";
import profileFallback from "../../src/profilelogo.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function BasicMenu() {
  const { logout, auth } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openProfile, setOpenProfile] = React.useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileOpen = () => {
    setOpenProfile(true);
    handleCloseMenu();
  };

  const handleProfileClose = () => {
    setOpenProfile(false);
  };

  // ✅ NEW: My Account Redirect
  const handleMyAccount = () => {
    navigate("/home/my-profile");
    handleCloseMenu();
  };

  const user = auth?.user;
  const profileImage = user?.profileImage
    ? `${BASE_URL}/${user.profileImage}`
    : profileFallback;

  return (
    <div>
      {/* Avatar Button (UPDATED GRADIENT) */}
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          borderRadius: "50%",
          padding: "4px",
          background: "linear-gradient(to bottom, #1E3A8A, #3B82F6)",
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            border: "2px solid white",
          }}
          alt={user?.userName || "Profile"}
          src={profileImage}
        />
      </Button>

      {/* Menu (UPDATED GRADIENT) */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(to bottom, #1E3A8A, #3B82F6)",
            color: "white",
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleProfileOpen} sx={{ color: "white" }}>
          Profile
        </MenuItem>

        {/* ✅ UPDATED */}
        <MenuItem onClick={handleMyAccount} sx={{ color: "white" }}>
          My Account
        </MenuItem>

        <MenuItem onClick={handleLogout} sx={{ color: "white" }}>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Dialog */}
      <Dialog
        open={openProfile}
        onClose={handleProfileClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to bottom, #1E3A8A, #3B82F6)",
            color: "white",
          }}
        >
          Admin Profile
          <IconButton
            aria-label="close"
            onClick={handleProfileClose}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <ProfileView />
        </DialogContent>
      </Dialog>
    </div>
  );
}