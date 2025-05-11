import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 shadow-sm">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center space-x-3"
        >
          <img src="/images/coding_login-logo.png" className="h-8" alt="Logo" />
          <span className="text-2xl font-bold dark:text-white">SkillJudge</span>
        </button>

        <div className="flex items-center space-x-6">
          <ul className="hidden md:flex space-x-6 font-medium text-gray-800">
            <li>
              <button
                onClick={() => handleNavigate("/")}
                className="hover:text-blue-600"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate("/create")}
                className="hover:text-blue-600"
              >
                Create
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate("/submission")}
                className="hover:text-blue-600"
              >
                Compiler
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate("/leaderboard")}
                className="hover:text-blue-600"
              >
                Leaderboard
              </button>
            </li>
            {user && (
              <li>
                <button onClick={handleLogout} className="hover:text-red-600">
                  Logout
                </button>
              </li>
            )}
          </ul>

          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                >
                  <UserCircleIcon className="w-8 h-8 text-black" />
                  <span className="text-sm font-medium text-black">
                    {user.firstname}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg z-50 border border-gray-200"
                    >
                      <div className="px-5 py-4">
                        <p className="text-lg font-semibold text-gray-800">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {user.email}
                        </p>
                      </div>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-xl"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button
                className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => handleNavigate("/login")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
