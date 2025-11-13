import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminPanel from "./pages/AdminPanel";
import ResourceDetail from "./pages/ResourceDetail";
import Resources from "./pages/Resources";
import Pending from "./pages/Pending";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pending" element={<Pending />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;