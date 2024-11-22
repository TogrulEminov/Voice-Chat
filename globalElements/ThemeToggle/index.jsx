"use client";

import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
const ThemeToggle = () => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!theme) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
        theme === "light"
          ? "bg-gray-200 text-gray-800 shadow-md hover:bg-gray-300 ring-gray-500"
          : "bg-gray-700 text-yellow-400 shadow-lg hover:bg-gray-600 ring-yellow-400"
      }`}
      aria-label="Toggle Dark Mode"
    >
      {theme === "light" ? (
        <FaMoon className="h-6 w-6" />
      ) : (
        <FaSun className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
