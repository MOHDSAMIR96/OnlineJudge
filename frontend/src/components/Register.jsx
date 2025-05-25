import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

   const handleNavigate = (path) => {
    navigate(path);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
        firstname,
        lastname,
        email,
        password,
      });

      if (response.data.status) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <img
          src="/images/coding_login.jpg"
          alt="Register"
          className="w-full h-40 object-cover rounded-md mb-5"
        />
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-5">
          Create Account
        </h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="First name"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setLastname(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-5">
          Already have an account?{" "}
          <a onClick={() => handleNavigate("/login")} className="text-green-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
