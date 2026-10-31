import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './views/home/Navbar';
import Home from './views/home/Home';
import Footer from './views/home/Footer';
import BookDetailPage from './views/book/BookDetailPage';
import { ToastProvider } from './context/ToastContext';
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
      <ToastProvider>
        <ScrollToTop />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
        </Routes>

        <Footer />
      </ToastProvider>
    </BrowserRouter>
  );
}

