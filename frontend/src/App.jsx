import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProblemManager from "./components/ProblemManager";
import Compiler from "./components/Compiler";
import Submission from "./components/Submission";
import Navbar from "./components/Navbar";
import Leaderboard from "./components/Leaderboard";
import { useEffect, useState } from "react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth(); // Destructure loading from useAuth
  const hideNavbarRoutes = ["/login", "/register"];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar user={user} />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Protected routes */}
        <Route
          path="/problem/:id"
          element={
            <ProtectedRoute>
              <Compiler userId={user?._id} /> {/* Safe access with optional chaining */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/submission"
          element={
            <ProtectedRoute>
              <Submission userId={user?._id} /> {/* Pass userId if needed */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <ProblemManager userId={user?._id} /> {/* Pass userId if needed */}
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
