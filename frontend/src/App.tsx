import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './views/Navbar';
import Footer from './views/Footer';
import Home from './views/home/Home';
import BookDetailPage from './views/book/BookDetailPage';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import MyBooks from './views/my-books/MyBooks';
import Dashboard from './views/dashboard/Dashboard';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/books/:id"
              element={
                <>
                  <Navbar />
                  <BookDetailPage />
                  <Footer />
                </>
              }
            />
            {/* Protected route for logged in users (any authenticated user) */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/my-books"
                element={
                  <>
                    <Navbar />
                    <MyBooks />
                    <Footer />
                  </>
                }
              />
            </Route>
            {/* Protected route for LIBRARIAN and ADMIN */}
            <Route
              element={<ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']} unauthorizedRedirect="/"/>}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
