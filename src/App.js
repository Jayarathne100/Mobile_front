import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/login";
import Dashboard from "./components/dailySale/dailySale";
import Category from "./components/category/category";
import Product from "./components/product/product";
import Stock from "./components/stock/stock";
import Sales from "./components/sales/sale";
import System from "./components/system/system";
import NoAccess from "./NoAccess";
import ProtectedRoute from "./privateRoute";
import Panel from "./components/panel/panel";
import './App.css'

function Layout({ children }) {
  const role = localStorage.getItem("role");

  return (
     <div className="layout-container">
      {role && <div className="panel"><Panel /></div>}
      <div className="main-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute requiredPage="Dashboard">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Category"
          element={
            <ProtectedRoute requiredPage="Category">
              <Layout>
                <Category />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Product"
          element={
            <ProtectedRoute requiredPage="Product">
              <Layout>
                <Product />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Stock"
          element={
            <ProtectedRoute requiredPage="Stock">
              <Layout>
                <Stock />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Sales"
          element={
            <ProtectedRoute requiredPage="Sales">
              <Layout>
                <Sales />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/System"
          element={
            <ProtectedRoute requiredPage="System">
              <Layout>
                <System />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* No Access Page */}
        <Route path="/NoAccess" element={<NoAccess />} />

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
