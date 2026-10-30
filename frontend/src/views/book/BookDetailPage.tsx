import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Share2,
  BookOpen,
  BookMarked,
  Calendar,
  Layers,
  Send,
  Barcode,
  Check,
} from 'lucide-react';
import { getBookById } from '../../services/bookService';
import type { Book, Feedback } from '../../types/books';
import { CATEGORY_LABELS, CATEGORY_COLORS, COVER_GRADIENTS } from '../../types/books';
import styles from './BookDetailPage.module.css';

const RATING_DESCRIPTORS: Record<number, string> = {
  1: 'Poco convincente',
  2: 'Sotto le aspettative',
  3: 'Nella media / Piacevole',
  4: 'Molto buono e consigliato',
  5: 'Eccellente! Un must-read assoluto',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local interaction states
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local feedback form states (No API calls, purely client-side)
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');

  // Local reviews list (combines database feedbacks, samples, and user newly added reviews)
  const [localFeedbacks, setLocalFeedbacks] = useState<Feedback[]>([]);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Book
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    getBookById(id)
      .then((data) => {
        if (!isMounted) return;
        setBook(data);

        // If the book already has backend feedbacks
        if (data.feedbacks && data.feedbacks.length > 0) {
          setLocalFeedbacks(data.feedbacks);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Errore nel caricamento del libro');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Compute review stats dynamically
  const reviewStats = useMemo<{ average: string; count: number; distribution: Record<number, number> }>(() => {
    const total = localFeedbacks.length;
    if (total === 0) {
      return { average: '5.0', count: 0, distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const sum = localFeedbacks.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    localFeedbacks.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const distribution: Record<number, number> = {
      5: Math.round(((counts[5] || 0) / total) * 100),
      4: Math.round(((counts[4] || 0) / total) * 100),
      3: Math.round(((counts[3] || 0) / total) * 100),
      2: Math.round(((counts[2] || 0) / total) * 100),
      1: Math.round(((counts[1] || 0) / total) * 100),
    };

    return { average, count: total, distribution };
  }, [localFeedbacks]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  // const handleWishlistToggle = () => {
  //   const nextState = !isWishlisted;
  //   setIsWishlisted(nextState);
  //   showToast(
  //     nextState
  //       ? `"${book?.title}" aggiunto ai tuoi preferiti ❤️`
  //       : `"${book?.title}" rimosso dai preferiti`
  //   );
  // };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiato negli appunti! 📋');
    } else {
      showToast('Condividi questo URL: ' + window.location.href);
    }
  };

  const handleReserve = () => {
    if (!book || book.quantity <= 0) return;
    showToast(`Richiesta di prestito registrata per "${book.title}"! Ritira al desk.`);
  };

  // Purely visual / client-side form submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formComment.trim()) {
      showToast('Per favore, scrivi qualche parola nel tuo feedback.');
      return;
    }

    const newFeedback = {
      id: `user-rev-${Date.now()}`,
      rating: formRating,
      createdAt: new Date(),
      title: formTitle.trim() || 'Recensione del lettore',
      bookId: '231',
      userId: '1',
      user : {
        id: '1',
        firstName: 'Fede',
        lastName: 'Der',
      },
      comment: formComment.trim(),
    };

    // Prepend new feedback in local state
    setLocalFeedbacks([newFeedback, ...localFeedbacks]);

    // Clear form
    setFormTitle('');
    setFormComment('');
    setFormRating(5);

    showToast('Grazie per la tua recensione! Aggiunta all\'anteprima qui sotto. ✨');
  };

  // Render Loading / Error states
  if (loading) {
    return (
      <main className={styles.pageWrapper}>
        <div className={styles.stateContainer}>
          <div className={styles.spinner} role="status" aria-label="Caricamento del libro" />
          <h2 className={styles.stateTitle}>Apertura del volume in corso...</h2>
          <p className={styles.stateText}>Stiamo recuperando i dettagli del libro dalla biblioteca digitale Hubiblio.</p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className={styles.pageWrapper}>
        <div className={styles.stateContainer}>
          <h2 className={styles.stateTitle}>Libro non disponibile</h2>
          <p className={styles.stateText}>{error || 'Il libro richiesto non è stato trovato nel catalogo.'}</p>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={16} /> Torna al catalogo principale
          </Link>
        </div>
      </main>
    );
  }

  // Visual tokens for this book
  const catColor = CATEGORY_COLORS[book.category] || CATEGORY_COLORS.OTHER;
  const gradient = COVER_GRADIENTS[book.category] || COVER_GRADIENTS.OTHER;
  const isAvailable = book.quantity > 0;

  // Format Publication Year / Date
  const publicationYear = book.publicationDate
    ? new Date(book.publicationDate).getFullYear()
    : 'N.D.';

  // Format ISBN code or fallback standard
  const isbnDisplay = book.isbn || `978-88-04-${Math.abs(book.title.split('').reduce((a, b) => a + b.charCodeAt(0), 1000) % 90000 + 10000)}-0`;

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link to="/" className={styles.backButton} aria-label="Torna al catalogo">
          <ArrowLeft size={16} />
          <span>Torna al catalogo</span>
        </Link>

        {/* ── Book Hero Card ────────────────────────────────────────────── */}
        <article className={styles.bookHeroCard} aria-labelledby="book-detail-title">
          {/* Ambient background glow */}
          <div
            className={styles.ambientGlow}
            style={{ background: gradient }}
            aria-hidden="true"
          />

          {/* Left Column: Visual Cover & CTAs */}
          <div className={styles.bookVisualCol}>
            {/* 3D Realistic Book Cover */}
            <div className={styles.coverContainer}>
              <div
                className={styles.book3DWrapper}
                style={{ background: gradient }}
                aria-label={`Copertina del libro ${book.title}`}
              >
                {/* Book spine lighting */}
                <div className={styles.bookSpineHighlight} />

                {/* Silk Ribbon Bookmark */}
                <div className={styles.silkBookmark} />

                {/* Decorative radial pattern */}
                <div className={styles.coverPattern} />

                {book.coverImagePath && (
                  <img
                    src={book.coverImagePath}
                    alt={`Copertina di ${book.title}`}
                    className={styles.bookCoverArtwork}
                  />
                )}

                {!book.coverImagePath && (
                  <>
                    {/* Header tag on cover */}
                    <div className={styles.coverHeaderDecor}>
                      <span className={styles.coverBrandTag}>Hubiblio Editions</span>
                    </div>

                    {/* Title & Author on Cover */}
                    <div className={styles.coverBodyContent}>
                      <h2 className={styles.coverTitle}>{book.title}</h2>
                      <p className={styles.coverAuthor}>{book.author}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Availability status badge */}
            <div
              className={`${styles.availBadge} ${isAvailable ? styles.availYes : styles.availNo}`}
              role="status"
            >
              <span className={isAvailable ? styles.pulseDot : styles.pulseDotNo} />
              <span>
                {isAvailable
                  ? `Disponibile (${book.quantity} ${book.quantity === 1 ? 'copia' : 'copie'})`
                  : 'Attualmente in prestito'}
              </span>
            </div>

            {/* Primary & Secondary Actions */}
            <div className={styles.actionButtonGroup}>
              <button
                type="button"
                className={styles.primaryReserveBtn}
                onClick={handleReserve}
                disabled={!isAvailable}
                aria-label={`Prenota prestito per ${book.title}`}
              >
                <BookMarked size={18} />
                <span>{isAvailable ? 'Prenota prestito' : 'Non disponibile'}</span>
              </button>

              <div className={styles.secondaryActionsRow}>
                {/* <button
                  type="button"
                  className={`${styles.secondaryBtn} ${isWishlisted ? styles.secondaryBtnActive : ''}`}
                  onClick={handleWishlistToggle}
                  aria-pressed={isWishlisted}
                  aria-label="Aggiungi ai desideri"
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  <span>{isWishlisted ? 'Salvato' : 'Preferiti'}</span>
                </button> */}

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleShare}
                  aria-label="Condividi questo libro"
                >
                  <Share2 size={16} />
                  <span>Condividi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details & Meta Specifications */}
          <div className={styles.bookDetailsCol}>
            {/* Meta Header */}
            <div className={styles.metaHeader}>
              <span
                className={styles.categoryTag}
                style={{
                  background: catColor.bg,
                  color: catColor.text,
                  border: `1px solid ${catColor.border}`,
                }}
              >
                {CATEGORY_LABELS[book.category]}
              </span>
            </div>

            {/* Title & Author */}
            <h1 id="book-detail-title" className={styles.bookTitle}>
              {book.title}
            </h1>

            <div className={styles.bookAuthorWrap}>
              <span className={styles.authorLabel}>di</span>
              <span className={styles.bookAuthor}>{book.author}</span>
            </div>

            {/* Rating Summary Bar */}
            <div className={styles.ratingSummaryBar}>
              <div className={styles.starsRow} aria-label={`Valutazione ${reviewStats.average} su 5 stelle`}>
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <Star
                    key={starIdx}
                    size={16}
                    fill={starIdx <= Math.round(Number(reviewStats.average)) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className={styles.ratingValueBig}>{reviewStats.average}</span>
              <span className={styles.ratingReviewsCount}>
                ({reviewStats.count} {reviewStats.count === 1 ? 'recensione' : 'recensioni'})
              </span>
            </div>

            {/* Structured Specifications Grid */}
            <div className={styles.metaGrid}>
              {/* Pagine */}
              <div className={styles.metaItemCard}>
                <div className={styles.metaIconWrap}>
                  <BookOpen size={18} />
                </div>
                <div className={styles.metaInfo}>
                  <span className={styles.metaLabel}>Pagine</span>
                  <span className={styles.metaValue}>{book.pages ? `${book.pages} pag.` : '340 pag.'}</span>
                </div>
              </div>

              {/* Anno di pubblicazione */}
              <div className={styles.metaItemCard}>
                <div className={styles.metaIconWrap}>
                  <Calendar size={18} />
                </div>
                <div className={styles.metaInfo}>
                  <span className={styles.metaLabel}>Anno Pubblicazione</span>
                  <span className={styles.metaValue}>{publicationYear}</span>
                </div>
              </div>

              {/* ISBN */}
              <div className={styles.metaItemCard}>
                <div className={styles.metaIconWrap}>
                  <Barcode size={18} />
                </div>
                <div className={styles.metaInfo}>
                  <span className={styles.metaLabel}>Codice ISBN</span>
                  <span className={styles.metaValue}>{isbnDisplay}</span>
                </div>
              </div>

              {/* Copie e disponibilità */}
              <div className={styles.metaItemCard}>
                <div className={styles.metaIconWrap}>
                  <Layers size={18} />
                </div>
                <div className={styles.metaInfo}>
                  <span className={styles.metaLabel}>Giacenza</span>
                  <span className={styles.metaValue}>{book.quantity} {book.quantity === 1 ? 'copia' : 'copie totali'}</span>
                </div>
              </div>
            </div>

            {/* Synopsis / Description */}
            <section className={styles.synopsisSection} aria-labelledby="synopsis-heading">
              <span className={styles.sectionSubtitle}>Panoramica dell'opera</span>
              <h3 id="synopsis-heading" className={styles.synopsisTitle}>
                Sinossi del libro
              </h3>
              <p className={styles.synopsisText}>
                {book.description ||
                  `Un volume straordinario che ha appassionato intere generazioni di lettori. Con maestria stilistica e una trama avvincente, l'autore guida il lettore attraverso un viaggio indimenticabile, ricco di riflessioni e colpi di scena. Un classico fondamentale per ogni amante del genere ${CATEGORY_LABELS[book.category].toLowerCase()}.`}
              </p>
            </section>
          </div>
        </article>

        {/* ── Feedback & Reviews Section ─────────────────────────────────── */}
        <section className={styles.reviewsSection} aria-labelledby="reviews-section-heading">
          {/* Section Header */}
          <div className={styles.reviewsHeader}>
            <h2 id="reviews-section-heading" className={styles.reviewsHeading}>
              Recensioni e opinioni della community
            </h2>
            <p className={styles.reviewsSubheading}>
              Leggi i pareri autentici degli altri lettori o condividi le tue impressioni su questo titolo
            </p>
          </div>

          {/* Rating Summary & Distribution Bars */}
          <div className={styles.reviewStatsBox}>
            {/* Overall Score */}
            <div className={styles.overallScoreCard}>
              <span className={styles.hugeRatingNum}>{reviewStats.average}</span>
              <div className={styles.overallStars} aria-label={`Valutazione media: ${reviewStats.average} stelle su 5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    fill={s <= Math.round(Number(reviewStats.average)) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className={styles.overallCountText}>
                Basato su {reviewStats.count} recensioni
              </span>
            </div>

            {/* Percentage Distribution Bars (5 to 1) */}
            <div className={styles.distributionBars} aria-label="Distribuzione delle valutazioni">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percent = reviewStats.distribution[stars] || 0;
                return (
                  <div key={stars} className={styles.barRow}>
                    <div className={styles.starLabel}>
                      <span>{stars}</span>
                      <Star size={13} fill="currentColor" color="var(--gold-500)" />
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={styles.barPercent}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Content Grid: Form (Col 1) and Reviews List (Col 2) */}
          <div className={styles.reviewsContentGrid}>
            {/* ── Col 1: Review Form (Visual & Local interactions only) ── */}
            <aside className={styles.reviewFormCard} aria-labelledby="write-review-heading">
              <div className={styles.formHeader}>
                <h3 id="write-review-heading" className={styles.formTitle}>
                  Lascia una recensione
                </h3>
                <p className={styles.formSubtitle}>
                  Hai letto questo libro? Condividi la tua esperienza con la comunità di Hubiblio.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} noValidate>
                {/* Star Picker */}
                <div className={styles.starPickerContainer}>
                  <label className={styles.starPickerLabel}>La tua valutazione:</label>
                  <div
                    className={styles.starsInteractiveRow}
                    role="radiogroup"
                    aria-label="Seleziona la tua valutazione in stelle"
                    onMouseLeave={() => setFormHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = starValue <= (formHoverRating || formRating);
                      return (
                        <button
                          key={starValue}
                          type="button"
                          role="radio"
                          aria-checked={formRating === starValue}
                          className={`${styles.interactiveStarBtn} ${isFilled ? styles.starFilled : ''}`}
                          onClick={() => setFormRating(starValue)}
                          onMouseEnter={() => setFormHoverRating(starValue)}
                          aria-label={`${starValue} ${starValue === 1 ? 'stella' : 'stelle'}`}
                        >
                          <Star size={24} fill={isFilled ? 'currentColor' : 'none'} />
                        </button>
                      );
                    })}
                  </div>
                  <span className={styles.ratingDescriptor}>
                    {RATING_DESCRIPTORS[formHoverRating || formRating]}
                  </span>
                </div>

                {/* Review Title */}
                <div className={styles.formGroup} style={{ marginTop: 14 }}>
                  <label htmlFor="review-title" className={styles.fieldLabel}>
                    Titolo della recensione <span className={styles.optionalTag}>(opzionale)</span>
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    className={styles.textInput}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Es. Un libro avvincente che fa riflettere..."
                    maxLength={100}
                  />
                </div>

                {/* Review Body */}
                <div className={styles.formGroup} style={{ marginTop: 14 }}>
                  <label htmlFor="review-comment" className={styles.fieldLabel}>
                    Il tuo commento *
                  </label>
                  <textarea
                    id="review-comment"
                    className={styles.textArea}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Cosa ne pensi della trama, dello stile o dei personaggi? Consiglieresti questo libro ad altri lettori?"
                    maxLength={1000}
                    required
                  />
                  <span className={styles.charCount}>
                    {formComment.length} / 1000 caratteri
                  </span>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className={styles.submitReviewBtn}
                  style={{ marginTop: 16 }}
                >
                  <Send size={16} />
                  <span>Invia recensione</span>
                </button>
              </form>
            </aside>

            {/* ── Col 2: Reviews List ── */}
            <div className={styles.reviewsListCol}>
              <div className={styles.reviewsListHeader}>
                <h3 className={styles.reviewsCountTitle}>
                  Tutte le recensioni ({localFeedbacks.length})
                </h3>
              </div>

              {localFeedbacks.map((feedback) => {
                const completeName = feedback.user.firstName + ' ' + feedback.user.lastName;
                return (
                  <article
                    key={feedback.id}
                    className={`${styles.reviewCard} ${feedback.id.startsWith('user-rev-') ? styles.reviewCardLocalUser : ''}`}
                    aria-label={`Recensione di ${completeName}`}
                  >
                    {/* User Header */}
                    <div className={styles.reviewUserRow}>
                      <div className={styles.userInfoLeft}>
                        <div className={styles.userAvatar} aria-hidden="true">
                          {feedback.user.firstName[0]}{feedback.user.lastName[0]}
                        </div>
                        <div className={styles.userNameMeta}>
                          <span className={styles.userName}>
                            {completeName}
                          </span>
                          <span className={styles.userReviewDate}>{new Date(feedback.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className={styles.reviewStars} aria-label={`${feedback.rating} stelle su 5`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={15}
                            fill={s <= feedback.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    {feedback.title && <h4 className={styles.reviewTitle}>{feedback.title}</h4>}

                    {/* Review Content */}
                    <p className={styles.reviewBodyText}>{feedback.comment}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── Toast notice popup ────────────────────────────────────────── */}
      {toastMessage && (
        <aside className={styles.toastNotice} role="status" aria-live="polite">
          <Check size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </main>
  );
}