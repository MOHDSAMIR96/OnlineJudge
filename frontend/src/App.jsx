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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  return user;
}

function AppContent() {
  const location = useLocation();
  const user = useAuth();
  const hideNavbarRoutes = ["/login", "/register"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        
        {/* Protected routes */}
        
        <Route 
          path="/problem/:id" 
          element={user ? <Compiler userId={user._id} /> : (
            <Navigate 
              to="/login" 
              state={{ 
                from: location.pathname,
                message: "Please login to access this problem" 
              }} 
              replace 
            />
          )} 
        />
        
        
        {/* Public routes */}
         {/* Public routes */}
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/submission" element={<Submission />} />
        <Route path="/create" element={<ProblemManager />} />
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