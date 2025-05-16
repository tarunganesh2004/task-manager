import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskBoard from "./components/TaskBoard";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<TaskBoard />} />
      </Routes>
    </Router>
  );
}

export default App;