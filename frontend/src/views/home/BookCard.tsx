import { Star, BookOpen } from 'lucide-react';
import { Link } from "react-router-dom";
import type { Book } from '../../types/books';
import { CATEGORY_LABELS, CATEGORY_COLORS, COVER_GRADIENTS } from '../../types/books';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  variant?: 'featured' | 'catalog';
}

export default function BookCard({ book }: BookCardProps) {
  const catColor = CATEGORY_COLORS[book.category];
  const gradient = COVER_GRADIENTS[book.category];

  return (
    <Link to={`/books/${book.id}`}>
      <article
        className={`${styles.card} ${styles.catalog}`}
        aria-label={`${book.title} di ${book.author}`}
      >
        {/* ── Cover ────────────────── */}
        <div className={styles.coverWrapper}>
          <div
            className={styles.cover}
            style={{ background: gradient }}
            aria-hidden="true"
          >
            {/* Decorative cover art */}
            <div className={styles.coverPattern} />
            {book.coverImagePath ? (
              <img
                className={styles.coverImg}
                src={book.coverImagePath}
                alt={`Copertina di ${book.title}`}
              />
            ) : (
              <div className={styles.coverTitle}>
                <span className={styles.coverTitleText}>{book.title}</span>
                <span className={styles.coverAuthorText}>{book.author}</span>
              </div>
            )}
          </div>

          {/* Wishlist button */}
          {/* <button
          className={styles.wishlistBtn}
          aria-label={`Aggiungi ${book.title} ai preferiti`}
          title="Aggiungi ai preferiti"
        >
          <Heart size={14} />
        </button> */}

          {/* Availability badge */}
          <div className={`${styles.availBadge} ${book.quantity > 0 ? styles.availYes : styles.availNo}`}>
            {book.quantity > 0 ? 'Disponibile' : 'Non disponibile'}
          </div>
        </div>

        {/* ── Info ─────────────────── */}
        <div className={styles.info}>
          {/* Category chip */}
          <span
            className={styles.categoryChip}
            style={{
              background: catColor.bg,
              color: catColor.text,
              border: `1px solid ${catColor.border}`,
            }}
          >
            {CATEGORY_LABELS[book.category]}
          </span>

          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>{book.author}</p>

          {/* Rating */}
          {book.rating && (
            <div className={styles.rating} aria-label={`Valutazione: ${book.rating} su 5`}>
              <Star size={12} fill="currentColor" />
              <span>{book.rating.toFixed(1)}</span>
              <span className={styles.ratingDot}>·</span>
              {book.pages && <span className={styles.pages}>{book.pages} pag.</span>}
            </div>
          )}

          {/* CTA */}
          <button className={styles.ctaBtn} aria-label={`Prenota ${book.title}`}>
            <BookOpen size={14} />
            <span>Prenota ora</span>
          </button>
        </div>
      </article>
    </Link>
  );
}
