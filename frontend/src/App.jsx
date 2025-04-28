import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProblemManager from "./components/ProblemManager";
import Compiler from "./components/Compiler";
import Submission from "./components/Submission";
import Navbar from "./components/Navbar";
import Leaderboard from "./components/Leaderboard";

// Wrapper component to use hooks like useLocation
function AppContent() {
  const location = useLocation();

  // List of routes where you don't want Navbar
  const hideNavbarRoutes = ["/login", "/register"];

  return (
    <>
      {/* Only show Navbar if current path is NOT in hideNavbarRoutes */}
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<ProblemManager />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/problem/:id" element={<Compiler />} />
        <Route path="/" element={<Home />} />
        <Route path="/submission" element={<Submission />} />
        <Route path="/leaderboard" element={<Leaderboard/>} />
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