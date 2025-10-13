import React, { useEffect, useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./DailySalesPage.css";

const DailySalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const CATEGORY_API = "http://localhost:3001/api/categories";
  const SALES_API = "http://localhost:3001/api/sales";
  const PRODUCT_API = "http://localhost:3001/api/products";
  const STOCK_API = "http://localhost:3001/api/stocks";

  // --- Fetch data from backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes, stocksRes, categoriesRes] = await Promise.all([
          axios.get(PRODUCT_API),
          axios.get(SALES_API),
          axios.get(STOCK_API),
          axios.get(CATEGORY_API),
        ]);
        setProducts(productsRes.data);
        setSales(salesRes.data);
        setStocks(stocksRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // --- Calculate daily summary ---
  useEffect(() => {
    if (!sales.length) return;

    const filteredSales = sales.filter((s) => {
      const saleDate = new Date(s.date).setHours(0, 0, 0, 0);
      const start = startDate ? startDate.setHours(0, 0, 0, 0) : null;
      const end = endDate ? endDate.setHours(0, 0, 0, 0) : null;
      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      return true;
    });

    const summaryMap = filteredSales.reduce((acc, sale) => {
      const dateStr = new Date(sale.date).toLocaleDateString();

      // Find corresponding stock to get cost price
      const stockItem = stocks.find(
        (st) =>
          st.brandName === sale.brandName && st.modelName === sale.modelName
      );

      const costPrice = stockItem ? stockItem.price : 0;
      const profit = (sale.price - costPrice) * sale.quantity;

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          totalItems: 0,
          totalIncome: 0,
          totalProfit: 0,
        };
      }

      acc[dateStr].totalItems += sale.quantity;
      acc[dateStr].totalIncome += sale.price * sale.quantity;
      acc[dateStr].totalProfit += profit;

      return acc;
    }, {});

    setDailySummary(Object.values(summaryMap));
  }, [sales, stocks, startDate, endDate]);

  return (
    <div className="daily-sales-page">
      <h1>Daily Sales Summary</h1>

      {/* --- Date Pickers --- */}
      <div className="date-filter">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        >
          Reset
        </button>
      </div>

      {/* --- Summary Boxes --- */}
      <div className="summary-boxes-row">
        <div className="sale-summary">
          <h3>Total Items Sold</h3>
          <p>{dailySummary.reduce((acc, day) => acc + day.totalItems, 0)}</p>
        </div>
        <div className="product-summary">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>
        <div className="stock-summary">
          <h3>Total Stocks</h3>
          <p>{stocks.length}</p>
        </div>
        <div className="category-summary">
          <h3>Total Categories</h3>
          <p>{categories.length}</p>
        </div>
      </div>

      {/* --- Daily Summary Table --- */}
      <div className="summary-boxes">
        {dailySummary.length === 0 ? (
          <p>No sales data available for selected dates</p>
        ) : (
          dailySummary.map((day) => (
            <div key={day.date} className="summary-box">
              <h2>📅 {day.date}</h2>
              <p>Total Items Sold: {day.totalItems}</p>
              <p>Total Income: ${day.totalIncome.toFixed(2)}</p>
              <p>Total Profit: ${day.totalProfit.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailySalesPage;
