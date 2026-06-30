import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

export const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(to right, #0f172a, #1e293b, #334155)", // Unified premium slate gradient
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "none",
    padding: "12px 16px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.875rem",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    padding: "12px 16px",
  },
}));
