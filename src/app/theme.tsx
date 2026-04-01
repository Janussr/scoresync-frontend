"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#d4af37",
    },
    secondary: {
      main: "#0f3b1d",
    },
    background: {
      default: "#031a09",
      paper: "#0b2413",
    },
    text: {
      primary: "#f5e6a8",
      secondary: "rgba(245, 230, 168, 0.72)",
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#f4b942",
    },
    error: {
      main: "#d96c6c",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    h1: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    h2: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    h3: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    h4: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    h5: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    h6: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontWeight: 700,
      color: "#f1c40f",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: "100%",
        },
        body: {
          minHeight: "100%",
          background: `
            radial-gradient(circle at top, rgba(20,80,20,0.35), transparent 35%),
            linear-gradient(180deg, #062b10 0%, #031a09 100%)
          `,
          color: "#f5e6a8",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },


      },

    },

    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(180deg, rgba(15,55,20,0.78), rgba(7,32,12,0.92))",
          border: "1px solid rgba(212, 175, 55, 0.28)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          backgroundImage: "none",
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(180deg, rgba(11,36,19,0.95), rgba(7,28,14,0.98))",
          color: "#f5e6a8",
          border: "1px solid rgba(212, 175, 55, 0.18)",
          borderRadius: "12px",
          boxShadow: "none",
          backgroundImage: "none",
          overflow: "hidden",
          marginBottom: "12px",

          "&::before": {
            display: "none",
          },

          "&.Mui-expanded": {
            margin: "0 0 12px 0",
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 56,
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor: "rgba(212, 175, 55, 0.04)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.08)",

          "&.Mui-expanded": {
            minHeight: 56,
          },
        },
        content: {
          margin: "12px 0",
          "&.Mui-expanded": {
            margin: "12px 0",
          },
        },
        expandIconWrapper: {
          color: "#d4af37",
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: 16,
          backgroundColor: "rgba(255,255,255,0.01)",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(212, 175, 55, 0.16)",
        },
      },
    },

    MuiButton: {

      
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        contained: {
          boxShadow: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background:
            "linear-gradient(180deg, rgba(12,38,20,0.98), rgba(7,28,14,1))",
          border: "1px solid rgba(212, 175, 55, 0.22)",
          color: "#f5e6a8",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.02)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(212, 175, 55, 0.24)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(212, 175, 55, 0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d4af37",
          },
        },
        input: {
          color: "#f5e6a8",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(245, 230, 168, 0.72)",
          "&.Mui-focused": {
            color: "#d4af37",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#d4af37",
        },
      },
    },


  },


});

export default theme;