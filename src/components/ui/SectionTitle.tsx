"use client";

import { Typography } from "@mui/material";
import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  color?: string;
  size?: "small" | "medium" | "large";
};

export default function SectionTitle({
  children,
  color = "white",
  size = "medium",
}: SectionTitleProps) {
  const fontSizeMap = {
    small: { xs: "1rem", sm: "1.2rem" },
    medium: { xs: "1.2rem", sm: "1.5rem" },
    large: { xs: "1.5rem", sm: "2rem" },
  };

  return (
    <Typography
      variant="h6"
      sx={{
        fontWeight: "bold",
        mb: 1,
        fontSize: fontSizeMap[size],
        borderBottom: `2px solid ${color}`,
        display: "inline-block",
        pb: 0.5,
        color: color,
      }}
    >
      {children}
    </Typography>
  );
}