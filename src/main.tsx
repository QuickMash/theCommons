import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import AppRouter from "./AppRouter";

import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/zen-dots/400.css";
import "@fontsource/anta";
import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "./theme.scss";

const commonsTheme = createTheme({
  fontFamily: "Space Grotesk, sans-serif, OpenMoji",
  headings: {
    fontFamily: "Anta, sans-serif, OpenMoji",
  },
  colors: {
    accent: [
      "#e9fdea",
      "#d6f7d7",
      "#adedaf",
      "#82e383",
      "#5dda5f",
      "#46d547",
      "#38d33a",
      "#2abf2d",
      "#1fa524",
      "#0b8f18",
    ],
  },
  primaryColor: "accent",
  primaryShade: 8,

  components: {
    Button: {
      defaultProps: {
        color: "accent",
      },
    },
    ActionIcon: {
      defaultProps: {
        color: "accent",
      },
    },
    Select: {
      defaultProps: {
        color: "accent",
      },
    },
    Stepper: {
      defaultProps: {
        color: "accent",
      },
      styles: () => ({
        stepIcon: {
          borderColor: "#222222 !important",
          transition: "border-color 300ms ease",
          "&[data-active], &[data-completed]": {
            borderColor: "var(--mantine-color-accent-8)",
          },
        },
        separator: {
          transition: "background-color 500ms ease",
          // Inactive line color
          backgroundColor: "#222222 !important",
          "&[data-active], &[data-completed]": {
            // Active line color
            backgroundColor: "var(--mantine-color-accent-8)",
          
          },
        },
      }),
    },
  },
});

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={commonsTheme} defaultColorScheme="dark">
    <AppRouter />
  </MantineProvider>,
);
