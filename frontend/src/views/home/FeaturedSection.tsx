import { useState } from 'react';
import { ChevronRight, Flame } from 'lucide-react';
import BookCard from './BookCard';
import type { Book } from '../../types/books';
import styles from './FeaturedSection.module.css';

interface FeaturedSectionProps {
  books: Book[];
}

export default function FeaturedSection({ books }: FeaturedSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const booksLastMonth = books.filter((book) =>
    book.publicationDate
      ? new Date(book.publicationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : false
  );

  if (booksLastMonth.length === 0) return null;

  return (
    <section className={styles.section} id="featured" aria-labelledby="featured-heading">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap} aria-hidden="true">
              <Flame size={18} />
            </div>
            <div>
              <h2 id="featured-heading" className={styles.heading}>In evidenza</h2>
              <p className={styles.subheading}>I libri usciti questo mese</p>
            </div>
          </div>
          <a href="#catalog" className={styles.viewAll}>
            Vedi tutti <ChevronRight size={16} />
          </a>
        </div>

        {/* Cards grid */}
        <div
          className={styles.grid}
          role="list"
          aria-label="Libri in evidenza"
        >
          {booksLastMonth.map((book, i) => (
            <div
              key={book.id}
              role="listitem"
              className={`${styles.gridItem} ${activeIdx === i ? styles.active : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <BookCard book={book} variant="featured" />
            </div>
          ))}
        </div>

        {/* Dot indicators (mobile) */}
        <div className={styles.dots} role="tablist" aria-label="Navigazione libri">
          {booksLastMonth.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={activeIdx === i}
              aria-label={`Libro ${i + 1}`}
              className={`${styles.dot} ${activeIdx === i ? styles.dotActive : ''}`}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
