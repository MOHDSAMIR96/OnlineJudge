
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProblemManager from "./components/ProblemManager";
import Compiler from "./components/Compiler";
import Submission from "./components/Submission";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<ProblemManager />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/problem/:id" element={<Compiler />} />
        <Route path="/" element={<Home/>} />
        <Route path="/submission" element ={<Submission/>}/>
      </Routes>
    </Router>
  );
}

export default App;

