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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/register", {
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
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <img src="/images/coding_login.jpg" alt="Register" className="w-full rounded-lg mb-4" />
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="First Name" className="w-full p-3 border rounded-md" onChange={(e) => setFirstname(e.target.value)} required />
          <input type="text" placeholder="Last Name" className="w-full p-3 border rounded-md" onChange={(e) => setLastname(e.target.value)} required />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-md" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-md" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md">Register</button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <a href="/login" className="text-green-500">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
