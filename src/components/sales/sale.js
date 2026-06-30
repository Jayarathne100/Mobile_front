import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SalesPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingId, setEditingId] = useState(null);

  const SALES_API = "http://localhost:3001/api/sales";
  const STOCK_API = "http://localhost:3001/api/stocks";
  const PRODUCT_API = "http://localhost:3001/api/products";

  useEffect(() => {
    fetchSales();
    fetchStocks();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(SALES_API);
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await axios.get(STOCK_API);
      setStocks(res.data);
    } catch (err) {
      console.error(err);
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
    setBrand("");
    setModel("");
    setPrice("");
    setQuantity("");
    setSaleDate(new Date().toISOString().split("T")[0]);
    setEditingId(null);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!brand || !model || !price || !quantity)
      return alert("Fill all fields");

    const saleQty = Number(quantity);
    let relevantStocks = stocks
      .filter((s) => s.brandName === brand && s.modelName === model)
      .sort((a, b) => new Date(b._id) - new Date(a._id));

    let totalAvailable = relevantStocks.reduce((sum, s) => sum + s.remainQ, 0);

    try {
      if (!editingId && totalAvailable < saleQty) {
        if (
          window.confirm(
            "Not enough stock! Do you want to add new stock for this product?"
          )
        ) {
          const newStockQty = Number(
            prompt("Enter quantity for new stock:", saleQty)
          );
          const newStockPrice = Number(
            prompt("Enter price for new stock:", price)
          );
          if (!newStockQty || !newStockPrice) return;

          const newStock = {
            brandName: brand,
            modelName: model,
            quantity: newStockQty,
            remainQ: newStockQty,
            price: newStockPrice,
          };

          await axios.post(STOCK_API, newStock);
          toast.success("New stock added!");
          await fetchStocks();

          // Refresh relevantStocks
          relevantStocks = stocks
            .filter((s) => s.brandName === brand && s.modelName === model)
            .sort((a, b) => new Date(b._id) - new Date(a._id));
          totalAvailable = relevantStocks.reduce((sum, s) => sum + s.remainQ, 0);

          if (totalAvailable < saleQty)
            return alert("Still not enough stock!");
        } else {
          return;
        }
      }

      let remainingQty = saleQty;
      for (let stockItem of relevantStocks) {
        if (remainingQty <= 0) break;
        const deductQty = Math.min(stockItem.remainQ, remainingQty);
        await axios.put(`${STOCK_API}/${stockItem._id}/decrease`, {
          quantity: deductQty,
        });
        remainingQty -= deductQty;
      }

      const saleData = {
        brandName: brand,
        modelName: model,
        price: Number(price),
        quantity: saleQty,
        total: Number(price) * saleQty,
        date: saleDate,
      };

      if (editingId) {
        await axios.put(`${SALES_API}/${editingId}`, saleData);
        toast.success("Sale updated!");
      } else {
        await axios.post(SALES_API, saleData);
        toast.success("Sale recorded!");
      }

      await fetchSales();
      await fetchStocks();
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error processing sale or updating stock");
    }
  };

  const handleEdit = (sale) => {
    setBrand(sale.brandName);
    setModel(sale.modelName);
    setPrice(sale.price);
    setQuantity(sale.quantity);
    setSaleDate(sale.date.split("T")[0]);
    setEditingId(sale._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      const sale = sales.find((s) => s._id === id);
      if (!sale) return;

      await axios.delete(`${SALES_API}/${id}`);

      // Restore stock
      const relevantStocks = stocks
        .filter(
          (s) => s.brandName === sale.brandName && s.modelName === sale.modelName
        )
        .sort((a, b) => new Date(a._id) - new Date(b._id)); // oldest first

      let remainingQty = sale.quantity;
      for (let stockItem of relevantStocks) {
        if (remainingQty <= 0) break;
        const restoreQty = Math.min(
          stockItem.quantity - stockItem.remainQ,
          remainingQty
        );
        await axios.put(`${STOCK_API}/${stockItem._id}/increase`, {
          quantity: restoreQty,
        });
        remainingQty -= restoreQty;
      }

      await fetchSales();
      await fetchStocks();
      toast.error("Sale deleted!");
    } catch (err) {
      console.error(err);
      alert("Error deleting sale or restoring stock");
    }
  };

  return (
    <div className="sales-container">
      <h1>Sales Management</h1>

      <form className="sales-form" onSubmit={handleAddOrUpdate}>
        {/* Brand */}
        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("");
          }}
          required
        >
          <option value="">Select Brand</option>
          {[...new Set(products.map((p) => p.brandName))].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Model */}
        <select
          value={model}
          onChange={(e) => {
            const selectedModel = e.target.value;
            setModel(selectedModel);

            const productItem = products.find(
              (p) => p.brandName === brand && p.modelName === selectedModel
            );
            if (productItem) setPrice(productItem.price);
          }}
          required
        >
          <option value="">Select Model</option>
          {products
            .filter((p) => p.brandName === brand)
            .map((p) => (
              <option key={p._id} value={p.modelName}>
                {p.modelName}
              </option>
            ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          required
        />

        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <table className="sale-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Price ($)</th>
            <th>Quantity</th>
            <th>Total ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No sales found
              </td>
            </tr>
          )}
          {sales.map((s) => (
            <tr key={s._id}>
              <td>{s.date.split("T")[0]}</td>
              <td>{s.brandName}</td>
              <td>{s.modelName}</td>
              <td>{s.price.toFixed(2)}</td>
              <td>{s.quantity}</td>
              <td>{s.total.toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SalesPage;
