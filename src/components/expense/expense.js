import React, { useState, useEffect } from "react";
import axios from "axios";
import "./expense.css";

function Expense() {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Base API URL
  const API_URL = "http://localhost:3001/api/expenses";

  // Fetch all expenses
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error("Error fetching expenses:", err));
  }, []);

  // Add or Update Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !amount) {
      return alert("Please enter all fields");
    }

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, { date, amount });
        setExpenses(
          expenses.map((exp) => (exp._id === editingId ? res.data : exp))
        );
        setEditingId(null);
      } else {
        const res = await axios.post(API_URL, { date, amount });
        setExpenses([...expenses, res.data]);
      }

      // Reset form
      setDate("");
      setAmount("");
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  // Delete Expense
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Edit Expense
  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setDate(exp.date.split("T")[0]);
    setAmount(exp.amount);
  };

  // Calculate Grand Total
  const grandTotal = expenses.reduce((total, exp) => total + Number(exp.amount), 0);

  return (
    <div className="container">
      <h2>Expense Tracker</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">{editingId ? "Update" : "Add"} Expense</button>
      </form>

      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount (LKR)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map((exp) => (
              <tr key={exp._id}>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td>{exp.amount}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(exp)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(exp._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No expenses yet</td>
            </tr>
          )}
        </tbody>
        {expenses.length > 0 && (
          <tfoot>
            <tr>
              <td><strong>Grand Total</strong></td>
              <td><strong>{grandTotal}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default Expense;
