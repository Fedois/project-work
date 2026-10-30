import { Search, Sparkles, TrendingUp } from 'lucide-react';
import styles from './Hero.module.css';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
}

const QUICK_SEARCHES = ['Fantasy', 'Thriller', 'Fantascienza', 'Romanzo', 'Horror'];

export default function Hero({ searchQuery, onSearchChange, onSearchSubmit }: HeroProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearchSubmit(searchQuery);
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* Background blobs */}
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />
      <div className={styles.blobC} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.content}>
        {/* Pill badge */}
        <div className={styles.badge}>
          <Sparkles size={13} />
          <span>La tua biblioteca digitale personale</span>
        </div>

        <h1 id="hero-heading" className={styles.heading}>
          Esplora un universo<br />
          <span className={styles.gradientText}>di storie straordinarie</span>
        </h1>

        <p className={styles.subtitle}>
          Migliaia di libri a portata di click. Scopri nuovi autori, esplora generi
          diversi e lasciati sorprendere dalla lettura.
        </p>

        {/* Search bar */}
        <div className={styles.searchWrapper} role="search">
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} aria-hidden="true" />
            <input
              id="hero-search"
              type="search"
              className={styles.searchInput}
              placeholder="Cerca per titolo, autore o genere…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKey}
              aria-label="Cerca libri"
              autoComplete="off"
            />
            <button
              className={styles.searchBtn}
              onClick={() => onSearchSubmit(searchQuery)}
              aria-label="Avvia ricerca"
            >
              Cerca
            </button>
          </div>

          {/* Quick search tags */}
          <div className={styles.quickSearch} aria-label="Ricerche rapide">
            <TrendingUp size={12} className={styles.trendIcon} aria-hidden="true" />
            <span className={styles.trendLabel}>Tendenze:</span>
            {QUICK_SEARCHES.map((t) => (
              <button
                key={t}
                className={styles.tag}
                onClick={() => { onSearchChange(t); onSearchSubmit(t); }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {/* <div className={styles.stats} aria-label="Statistiche biblioteca">
          {[
            { value: '12.400+', label: 'Libri disponibili' },
            { value: '3.200+', label: 'Autori' },
            { value: '48', label: 'Generi' },
          ].map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}
