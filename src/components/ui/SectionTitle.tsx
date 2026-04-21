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
  color,
  size = "medium",
}: SectionTitleProps) {
  const fontSizeMap = {
    small: { xs: "1rem", sm: "1.2rem" },
    medium: { xs: "1.3rem", sm: "1.6rem" },
    large: { xs: "1.6rem", sm: "2.2rem" },
  };

  return (
    <Typography
      sx={{
        fontWeight: 700,
        mb: 1.5,
        fontSize: fontSizeMap[size],
        fontFamily: "Playfair Display, serif",
        letterSpacing: "0.05em",
        color: color || "primary.main",

        display: "inline-block",
        position: "relative",
        pb: 0.5,

        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "2px",
          background: "linear-gradient(90deg, #d4af37, transparent)",
        },
      }}
    >
      {children}
    </Typography>
  );
}