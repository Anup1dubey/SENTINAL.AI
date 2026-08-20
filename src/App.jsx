import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import DashboardPage from "./pages/DashboardPage";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route
            path="/upload"
            element={
              <Layout>
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <Layout>
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <Layout>
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
