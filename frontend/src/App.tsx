import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './views/home/Navbar';
import Home from './views/home/Home';
import Footer from './views/home/Footer';
import BookDetailPage from './views/book/BookDetailPage';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
