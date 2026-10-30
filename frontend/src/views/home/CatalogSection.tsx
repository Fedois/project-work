import { useState, useEffect } from 'react';
import { SlidersHorizontal, Library, X, RotateCcw, Search } from 'lucide-react';
import BookCard from './BookCard';
import type { Book, Category } from '../../types/books';
import { CATEGORY_LABELS } from '../../types/books';
import { getBooks } from '../../services/bookService';
import styles from './CatalogSection.module.css';

interface CatalogSectionProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Titolo (A–Z)' },
  { value: 'title-desc', label: 'Titolo (Z–A)' },
  { value: 'rating', label: 'Valutazione' },
  { value: 'year', label: 'Anno' },
];

export default function CatalogSection({ searchQuery, onClearSearch }: CatalogSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState('title-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend whenever filters or search query change
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getBooks({
      search: searchQuery,
      category: selectedCategories,
      sortBy,
    })
      .then((data) => {
        if (!cancelled) {
          setBooks(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || 'Impossibile caricare i libri.');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategories, sortBy]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy('title-asc');
    if (onClearSearch) onClearSearch();
  };

  const hasActiveFilters = selectedCategories.length > 0 || sortBy !== 'title-asc' || !!searchQuery.trim();

  return (
    <section className={styles.section} id="catalog" aria-labelledby="catalog-heading">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap} aria-hidden="true">
              <Library size={18} />
            </div>
            <div>
              <h2 id="catalog-heading" className={styles.heading}>Tutto il catalogo</h2>
              <p className={styles.subheading}>
                {isLoading
                  ? 'Ricerca e aggiornamento catalogo in corso…'
                  : `${books.length} ${books.length === 1 ? 'libro trovato' : 'libri trovati'}`}
              </p>
            </div>
          </div>

          <div className={styles.controls}>
            {/* Sort */}
            <div className={styles.sortWrapper}>
              <label htmlFor="sort-select" className="sr-only">Ordina per</label>
              <select
                id="sort-select"
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordina risultati"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Filter toggle */}
            <button
              className={`${styles.filterBtn} ${showFilters ? styles.filterActive : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <SlidersHorizontal size={15} />
              <span>Filtra</span>
              {selectedCategories.length > 0 && (
                <span className={styles.filterCount}>{selectedCategories.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Active search pill */}
        {searchQuery.trim() && (
          <div className={styles.activeSearchBanner} role="status">
            <Search size={14} />
            <span>Risultati per:</span>
            <span className={styles.activeSearchPill}>
              &ldquo;{searchQuery}&rdquo;
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className={styles.clearSearchBtn}
                  aria-label="Rimuovi filtro di ricerca"
                  title="Rimuovi filtro"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div
            id="filter-panel"
            className={styles.filterPanel}
            role="region"
            aria-label="Filtri per genere"
          >
            <div className={styles.filterHeader}>
              <span className={styles.filterTitle}>Filtra per genere</span>
              {hasActiveFilters && (
                <button className={styles.clearBtn} onClick={clearFilters}>
                  <X size={13} /> Azzera tutti i filtri
                </button>
              )}
            </div>
            <div className={styles.filterChips}>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterChip} ${selectedCategories.includes(cat) ? styles.chipActive : ''}`}
                  onClick={() => toggleCategory(cat)}
                  aria-pressed={selectedCategories.includes(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>{error}</span>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setError(null);
                setIsLoading(true);
                getBooks({ search: searchQuery, category: selectedCategories, sortBy })
                  .then(setBooks)
                  .finally(() => setIsLoading(false));
              }}
            >
              <RotateCcw size={14} style={{ display: 'inline', marginRight: 6 }} /> Riprova
            </button>
          </div>
        )}

        {/* Books grid / Skeletons */}
        {isLoading ? (
          <div className={styles.grid} aria-label="Caricamento libri...">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonBody}>
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} style={{ width: '80%', height: 18 }} />
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className={styles.grid} role="list" aria-label="Catalogo libri">
            {books.map((book) => (
              <div key={book.id} role="listitem">
                <BookCard book={book} variant="catalog" />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} role="alert" aria-live="polite">
            <span className={styles.emptyEmoji} aria-hidden="true">📚</span>
            <h3>Nessun libro trovato</h3>
            <p>Prova a modificare i filtri o il termine di ricerca inserito.</p>
            <button className={styles.resetBtn} onClick={clearFilters}>Azzera filtri</button>
          </div>
        )}
      </div>
    </section>
  );
}
