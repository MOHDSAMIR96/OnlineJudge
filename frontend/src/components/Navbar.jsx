import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Apply dark mode class to <html> and update styles
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      document.body.classList.add("bg-gray-900", "text-white"); // Dark mode background
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.add("bg-white", "text-black"); // Light mode background
      document.body.classList.remove("bg-gray-900", "text-white");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-all duration-300`}>
      <nav className={`border-b ${darkMode ? "bg-gray-900 border-gray-400 text-white" : "bg-white border-gray-200 text-black"} transition-all duration-300`}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          
          {/* LOGO */}
          <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/images/coding_login-logo.png" className="h-8" alt="code" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap">Coding</span>
          </a>

          {/* USER PROFILE DROPDOWN */}
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="User" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className={`absolute right-4 mt-2 w-48 divide-y rounded-lg shadow-lg ${darkMode ? "bg-gray-700 text-white divide-gray-600" : "bg-white text-black divide-gray-100"}`}>
                <div className="px-4 py-3 mt-10">
                  <span className="block text-sm">Bonnie Green</span>
                  <span className="block text-sm truncate">name@flowbite.com</span>
                </div>
                <ul className="py-2">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* TOGGLE BUTTON FOR MOBILE MENU */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>

          {/* NAVIGATION MENU */}
          <div className={`w-full ${menuOpen ? "block" : "hidden"} md:flex md:w-auto md:order-1`}>
            <ul className={`flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-100 text-black"} md:space-x-8 md:flex-row md:mt-0 md:border-0`}>
              <li>
                <a href="#" className="block py-2 px-3 rounded-sm md:bg-transparent md:p-0">Home</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0">Problem</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0">Create</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0">LeaderBoard</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0">logout</a>
              </li>
              
              {/* DARK/LIGHT MODE TOGGLE */}
              <li>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="block py-2 px-3 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4.95 2.636a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM17 10a1 1 0 110 2h-1a1 1 0 110-2h1zM10 17a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm-6.364-1.95a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 10a1 1 0 110-2h1a1 1 0 110 2H3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 000 16 8 8 0 100-16zM10 4a6 6 0 010 12A6 6 0 0110 4z" />
                    </svg>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
