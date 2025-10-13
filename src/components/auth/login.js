import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const API_URL = "http://localhost:3001/api/users";

function Login() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // Fetch users from backend
  const getUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (!foundUser) {
      alert("Invalid email or password!");
      return;
    }

    // Save user session data
    localStorage.setItem("role", foundUser.role);
    localStorage.setItem("email", foundUser.email);
    localStorage.setItem("access", JSON.stringify(foundUser.access));

    alert(`Welcome ${foundUser.email}!`);

    // Admin → full access → go to Dashboard
    if (foundUser.role === "Admin") {
      navigate("/Dashboard");
    } 
    // Staff → first accessible page
    else if (foundUser.access.length > 0) {
      const firstPage = foundUser.access[0].replace(/\s+/g, "");
      navigate(`/${firstPage}`);
    } else {
      alert("No page access assigned!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
