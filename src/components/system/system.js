import React, { useState, useEffect } from "react";
import axios from "axios";
import "./system.css";

const pages = ["Dashboard", "Category", "Product", "Stock", "Sales", "System"];
const API_URL = "http://localhost:3001/api/users";

function System() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    access: [],
  });

  // Fetch all users
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

  // Handle text input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle checkbox change
  const handleAccessChange = (e) => {
    const value = e.target.value;
    setFormData((prev) =>
      prev.access.includes(value)
        ? { ...prev, access: prev.access.filter((a) => a !== value) }
        : { ...prev, access: [...prev.access, value] }
    );
  };

  // Add new user
  const handleAddUser = async () => {
    const { email, password, role, access } = formData;

    // Validation
    if (!email || !password || !role || access.length === 0) {
      return alert("All fields are required!");
    }

    try {
      await axios.post(API_URL, formData);
      alert("User added successfully!");
      setFormData({ email: "", password: "", role: "", access: [] });
      getUsers();
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Error adding user");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        getUsers();
      } catch (err) {
        console.error(err.message);
        alert("Error deleting user");
      }
    }
  };

  return (
    <div className="role-container">
      <h2>User Role Management</h2>

      {/* Add User Form */}
      <div className="role-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
        </select>

        <div className="checkbox-group">
          {pages.map((page) => (
            <label key={page}>
              <input
                type="checkbox"
                value={page}
                checked={formData.access.includes(page)}
                onChange={handleAccessChange}
              />
              {page}
            </label>
          ))}
        </div>

        <button onClick={handleAddUser}>Add User</button>
      </div>

      {/* Users Table */}
      <div className="role-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Page Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.access.join(", ")}</td>
                  <td>
                    <button onClick={() => handleDelete(user._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default System;
