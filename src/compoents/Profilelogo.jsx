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

  const getProfileImage = () => {
    if (!user?.profileImage) return profileFallback;
    if (user.profileImage.startsWith('http')) return user.profileImage;
    // Remove leading slash if BASE_URL already has trailing slash (or vice-versa) to avoid double slashes
    const cleanBase = BASE_URL.replace(/\/$/, "");
    const cleanPath = user.profileImage.replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  };

  const profileImage = getProfileImage();

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
          padding: "2px",
          background: "transparent",
          "&:hover": {
            background: "rgba(0,0,0,0.05)"
          }
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            border: "2px solid #e5e7eb",
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
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1.5,
            minWidth: 180,
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileOpen} sx={{ color: "#374151", py: 1.5, fontWeight: 500 }}>
          Profile
        </MenuItem>

        {/* ✅ UPDATED */}
        <MenuItem onClick={handleMyAccount} sx={{ color: "#374151", py: 1.5, fontWeight: 500 }}>
          My Account
        </MenuItem>

        <MenuItem onClick={handleLogout} sx={{ color: "#EF4444", py: 1.5, fontWeight: 500 }}>
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
            background: "white",
            color: "#111827",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
          }}
        >
          Admin Profile
          <IconButton
            aria-label="close"
            onClick={handleProfileClose}
            sx={{ color: "#6b7280" }}
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