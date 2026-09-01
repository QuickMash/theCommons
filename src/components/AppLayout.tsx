import { Minus, Square, X } from "lucide-react";
import { Portal } from "@mantine/core";

export function animateWindowTitle() {
  const title = document.getElementById("windowTitle");

  if (!title) {
    return;
  }

  title.classList.remove("window-title-animate");
  void title.offsetWidth;
  title.classList.add("window-title-animate");
}

export default function AppLayout({ children }) {
  return (
    <>
      <Portal>
        <header 
          className="title-bar" 
          style={{ 
            zIndex: 300,
            WebkitAppRegion: "drag" 
          }}
        >
          <span
            id="windowTitle"
            className="window-title title-bar-label"
            onClick={animateWindowTitle}
            tabIndex={-1}
            style={{ WebkitAppRegion: "no-drag" }}
          >
            TheCommons.dev
          </span>
          <nav className="window-controls" aria-label="Window controls" style={{ WebkitAppRegion: "no-drag" }}>
            <button
              tabIndex={-1}
              type="button"
              aria-label="Minimize"
              onClick={() => window.electron.ipcRenderer.send("window-minimize")}
            >
              <Minus size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              tabIndex={-1}
              type="button"
              aria-label="Maximize"
              onClick={() =>
                window.electron.ipcRenderer.send("window-toggle-maximize")
              }
            >
              <Square size={15} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              tabIndex={-1}
              className="window-close-btn"
              type="button"
              aria-label="Close"
              onClick={() => window.electron.ipcRenderer.send("window-close")}
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        </header>
      </Portal>
      
      <main className="app-shell">{children}</main>
    </>
  );
}
