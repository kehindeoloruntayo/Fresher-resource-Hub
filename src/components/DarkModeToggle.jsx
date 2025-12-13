import { useState, useEffect } from "react";
import "./DarkModeToggle.css";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && prefersDark);
    setIsDark(initial);
    document.documentElement.setAttribute("data-theme", initial ? "dark" : "light");
  }, []);

  const toggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className="dark-mode-toggle-wrapper">
      <input
        type="checkbox"
        id="dark-mode-toggle"
        className="dark-mode-toggle-input"
        checked={isDark}
        onChange={toggle}
      />
      <label htmlFor="dark-mode-toggle" className="dark-mode-toggle-label">
        <span className="dark-mode-toggle-slider"></span>
      </label>
    </div>
  );
}