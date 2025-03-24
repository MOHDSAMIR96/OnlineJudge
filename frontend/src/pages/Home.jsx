import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 text-white">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-2xl w-full text-center text-gray-900">
        <h1 className="text-4xl font-bold mb-4">Welcome to Online Judge</h1>
        <p className="text-lg text-gray-700 mb-6">Solve coding problems and improve your skills!</p>
        <button onClick={handleLogout} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
