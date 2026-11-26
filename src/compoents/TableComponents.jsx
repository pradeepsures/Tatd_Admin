import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

export const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: "#f9fafb",
    color: "#667085",
    fontWeight: 600,
    fontSize: "0.75rem",
    borderBottom: "1px solid #e4e7ec",
    padding: "11px 16px",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.875rem",
    color: "#344054",
    borderBottom: "1px solid #eaecf0",
    padding: "12px 16px",
  },
}));
