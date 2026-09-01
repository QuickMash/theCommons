import { useState, useEffect } from "react";

export function customThemes() {
  const [themes, setThemes] = useState([]);

  const fetchThemes = async () => {
    try {
      const loadedThemes = await window.electronAPI.loadThemes();
      setThemes(loadedThemes);
    } catch (err) {
      console.error("Unable to load themes: ", err);
    }
  };

  useEffect(() => {
    fetchThemes(); // Init

    // Update themes upon change.
    if (window.electronAPI?.onThemesChanged) {
      window.electronAPI.onThemesChanged(() => {
        fetchThemes();
      });
    }
  }, []);

  // Make label stuff
  const selectData = themes.map((t) => ({ value: t.name, label: t.name }));

  const getTheme = async (name) => {
    if (!name) return null;
    return window.electronAPI.getTheme(name);
  };

  return { themes, selectData, refreshThemes: fetchThemes, getTheme };
}
