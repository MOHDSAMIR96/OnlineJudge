import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar1 = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleCreateProblem = () => {
    navigate("/create");
  };
  const handleCompiler= () => {
    navigate("/compiler");
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a onClick={handleHome} className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/images/coding_login-logo.png" className="h-8" alt="Coding Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Coding
          </span>
        </a>

        {/* USER PROFILE DROPDOWN */}
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {user ? (
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="User" />
            </button>
          ) : (
            <button
              className="text-sm bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}

          {dropdownOpen && user && (
            <div className="absolute right-4 mt-2 w-48 divide-y rounded-lg shadow-lg bg-white text-black divide-gray-100">
              <div className="px-4 py-3 mt-10">
                <span className="block text-sm">{user.firstname} {user.lastname}</span>
                <span className="block text-sm truncate">{user.email}</span>
              </div>
              <ul className="py-2">
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
            <li>
              <a onClick={handleHome} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100" >
                Home
              </a>
            </li>
            <li>
              <a  onClick={handleCreateProblem} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100">
                Create
              </a>
            </li>
            <li>
              <a onClick={handleCompiler} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100">
                Compiler
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100">
                Leaderboard
              </a>
            </li>
            {user && (
              <li>
                <a onClick={handleLogout} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100" >
                  Logout
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar1;
