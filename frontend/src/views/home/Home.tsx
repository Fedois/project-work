import { useState, useEffect } from 'react';
import { getBooks } from '../../services/bookService';
import type { Book } from '../../types/books';
import Hero from './Hero';
import FeaturedSection from './FeaturedSection';
import CatalogSection from './CatalogSection';

export default function Home(){
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        // add books in evidence from backend (sorted by rating)
        getBooks({ sortBy: 'rating' })
        .then((books) => {
            setBooks(books);
        })
        .catch((err) => {
            console.error('Errore nel recupero dei libri in evidenza:', err);
        });
    }, []);

    const handleSearchSubmit = (q: string) => {
        setActiveSearch(q);
        // Scroll to catalog if search is performed
        if (q.trim()) {
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleClearSearch = () => {
        setActiveSearch('');
        setSearchQuery('');
    };

    return (
        <main id="main-content">
            <Hero
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
            />

            <FeaturedSection books={books} />

            <CatalogSection
                searchQuery={activeSearch}
                onClearSearch={handleClearSearch}
            />
        </main>
    )
}