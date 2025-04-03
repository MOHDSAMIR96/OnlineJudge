import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      if (response.data.status) {
        localStorage.setItem("token", response.data.user.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <img src="/images/coding_login.jpg" alt="Login" className="w-full rounded-lg mb-4" />
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Enter your email" className="w-full p-3 border rounded-md" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Enter your password" className="w-full p-3 border rounded-md" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Login</button>
        </form>
        <p className="text-center mt-4">
          Don't have an account? <a href="/register" className="text-blue-500">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
