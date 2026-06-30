import React, { useState, useEffect } from "react";
import axios from "axios";
import "./category.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:3001/api/categories";

function CategoryPage() {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  // Load categories
  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model || !formData.category) {
      toast.warn("All fields are required!");
      return;
    }

    try {
      if (editId) {
        // Update existing
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Category updated successfully!");
      } else {
        // Add new
        await axios.post(API_URL, formData);
        toast.success("Category added successfully!");
      }
      getCategories();
      setFormData({ brand: "", model: "", category: "" });
      setEditId(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error saving category!");
    }
  };

  const handleEdit = (id) => {
    const category = categories.find((c) => c._id === id);
    if (!category) return;
    setFormData({
      brand: category.brand,
      model: category.model,
      category: category.category,
    });
    setEditId(id);
    toast.info("Editing category...");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      getCategories();
      toast.error("Category deleted!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category!");
    }
  };

  return (
    <div className="category-container">
      <h2>Category Management</h2>

      <div className="form">
        <input
          type="text"
          name="brand"
          placeholder="Brand Name"
          value={formData.brand}
          onChange={handleChange}
        />
        <input
          type="text"
          name="model"
          placeholder="Model Name"
          value={formData.model}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>Brand Name</th>
            <th>Model Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c._id}>
                <td>{c.brand}</td>
                <td>{c.model}</td>
                <td>{c.category}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(c._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default CategoryPage;
