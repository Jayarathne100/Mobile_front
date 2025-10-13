import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);

  const STOCK_API = "http://localhost:3001/api/stocks";
  const PRODUCT_API = "http://localhost:3001/api/products";

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get(STOCK_API);
      setStocks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stocks!");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setBrandName("");
    setModelName("");
    setQuantity("");
    setPrice("");
    setEditingId(null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!brandName || !modelName || !quantity || !price) {
    return alert("Fill all fields!");
  }

  const stockData = {
    brandName,
    modelName,
    quantity: Number(quantity),
    remainQ: Number(quantity),
    price: Number(price),
  };

  try {
    if (editingId) {
      // Update existing stock
      await axios.put(`${STOCK_API}/${editingId}`, stockData);
      toast.success("Stock updated successfully!");
    } else {
      // Always create a new stock row
      await axios.post(STOCK_API, stockData);
      toast.success("Stock added successfully!");
    }

    fetchStocks();
    resetForm();
  } catch (err) {
    console.error(err.response?.data || err.message);
    toast.error("Error saving stock!");
    alert(err.response?.data?.error || "Error saving stock");
  }
};


  const handleEdit = (stock) => {
    setBrandName(stock.brandName);
    setModelName(stock.modelName);
    setQuantity(stock.quantity);
    setPrice(stock.price);
    setEditingId(stock._id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${STOCK_API}/${id}`);
      fetchStocks();
      toast.error("Stock deleted!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error deleting stock");
      toast.error("Failed to delete stock!");
    }
  };

  const getStatusColor = (q) => {
    if (q > 6) return "green";
    else if (q > 0) return "orange";
    else return "red";
  };

  const grandTotal = stocks.reduce(
    (total, s) => total + s.price * s.quantity,
    0
  );

  return (
    <div className="stock-container">
      <h1>Stock Management</h1>

      <form className="stock-form" onSubmit={handleSubmit}>
        <select
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          required
        >
          <option value="">Select Brand</option>
          {[...new Set(products.map((p) => p.brandName))].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          required
        >
          <option value="">Select Model</option>
          {products
            .filter((p) => p.brandName === brandName)
            .map((p) => (
              <option key={p.modelName} value={p.modelName}>
                {p.modelName}
              </option>
            ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Price ($)</th>
            <th>Quantity (Initial)</th>
            <th>Remain Q</th>
            <th>Total ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.length === 0 && (
            <tr>
              <td colSpan="8">No stock found</td>
            </tr>
          )}
          {stocks.map((s) => (
            <tr key={s._id}>
              <td
                style={{ color: getStatusColor(s.remainQ), fontWeight: "bold" }}
              >
                {s.remainQ > 6
                  ? "In Stock"
                  : s.remainQ > 0
                  ? "Low Stock"
                  : "Out of Stock"}
              </td>
              <td>{s.brandName}</td>
              <td>{s.modelName}</td>
              <td>{s.price.toFixed(2)}</td>
              <td>{s.quantity}</td>
              <td>{s.remainQ}</td>
              <td>{(s.price * s.quantity).toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        {stocks.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
                Grand Total:
              </td>
              <td style={{ fontWeight: "bold" }}>{grandTotal.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default StockPage;
