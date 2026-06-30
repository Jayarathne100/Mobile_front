import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductPage.css";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);

  const [category, setCategory] = useState("");
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [models, setModels] = useState([]);
  const [modelName, setModelName] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);

  const PRODUCT_API = "http://localhost:3001/api/products";
  const CATEGORY_API = "http://localhost:3001/api/categories";

  // Fetch products
  const getProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch categories
  const getCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategoriesData(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  // Filter brands when category changes
  useEffect(() => {
    if (!category) {
      setBrands([]);
      setBrandName("");
      setModels([]);
      setModelName("");
      return;
    }
    const filteredBrands = categoriesData
      .filter((c) => c.category === category)
      .map((c) => c.brand)
      .filter((v, i, a) => a.indexOf(v) === i); // unique brands

    setBrands(filteredBrands);
    setBrandName("");
    setModels([]);
    setModelName("");
  }, [category, categoriesData]);

  // Filter models when brand changes
  useEffect(() => {
    if (!brandName) {
      setModels([]);
      setModelName("");
      return;
    }
    const filteredModels = categoriesData
      .filter((c) => c.category === category && c.brand === brandName)
      .map((c) => c.model)
      .filter((v, i, a) => a.indexOf(v) === i); // unique models

    setModels(filteredModels);
    setModelName("");
  }, [brandName, category, categoriesData]);

  // Add or update product
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const newProduct = {
      category,
      brandName,
      modelName,
      price: Number(price),
    };

    try {
      if (editId) {
        await axios.put(`${PRODUCT_API}/${editId}`, newProduct);
        setEditId(null);
      } else {
        await axios.post(PRODUCT_API, newProduct);
      }
      getProducts();
      clearForm();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // Load product into form for editing
  const handleEdit = (id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    setCategory(product.category);
    setBrandName(product.brandName);
    setModelName(product.modelName);
    setPrice(product.price);
    setEditId(product._id);
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${PRODUCT_API}/${id}`);
      getProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Clear form
  const clearForm = () => {
    setCategory("");
    setBrandName("");
    setModelName("");
    setPrice("");
    setEditId(null);
  };

  return (
    <div className="product-page">
      <h1>Product Management</h1>

      <form className="product-form" onSubmit={handleAddOrUpdate}>
        {/* Category Dropdown */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          {categoriesData
            .map((c) => c.category)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </select>

        {/* Brand Dropdown (filtered by selected category) */}
        <select value={brandName} onChange={(e) => setBrandName(e.target.value)} required>
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Model Dropdown (filtered by selected brand & category) */}
        <select value={modelName} onChange={(e) => setModelName(e.target.value)} required>
          <option value="">Select Model</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
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

        <button type="submit">{editId ? "Update" : "Add"}</button>
        {editId && (
          <button type="button" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      <table className="product-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Brand Name</th>
            <th>Model Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No products available.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id}>
                <td>{product.category}</td>
                <td>{product.brandName}</td>
                <td>{product.modelName}</td>
                <td>${product.price}</td>
                <td>
                  <button onClick={() => handleEdit(product._id)}>Edit</button>
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage;
