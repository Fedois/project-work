import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { addFeedback, getBookById } from '../../services/book.service';
import { createReservation, checkBookReservation } from '../../services/reservation.service';
import type { Book, Feedback } from '../../types/books';
import type { Reservation } from '../../types/reservations';
import { CATEGORY_LABELS, CATEGORY_COLORS, COVER_GRADIENTS } from '../../types/books';
import styles from './BookDetailPage.module.css';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import LoadingBox from '../../components/LoadingBox';

const RATING_DESCRIPTORS: Record<number, string> = {
  1: 'Poco convincente',
  2: 'Sotto le aspettative',
  3: 'Nella media / Piacevole',
  4: 'Molto buono e consigliato',
  5: 'Eccellente! Un must-read assoluto',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reservation state
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [reserving, setReserving] = useState(false);

  // Local interaction states
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();

  // Local feedback form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Local reviews list (combines database feedbacks and user newly added reviews)
  const [localFeedbacks, setLocalFeedbacks] = useState<Feedback[]>([]);

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

  // Check user active reservation for this book
  useEffect(() => {
    if (!id || !user) {
      setCurrentReservation(null);
      return;
    }

    let isMounted = true;
    checkBookReservation(id)
      .then((res) => {
        if (isMounted) {
          setCurrentReservation(res);
        }
      })
      .catch((err) => {
        console.error('Errore nel controllo della prenotazione:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  // Feedbacks ordered from most recent to least recent
  const sortedFeedbacks = useMemo(() => {
    return [...localFeedbacks].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [localFeedbacks]);

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
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiato negli appunti! 📋');
    } else {
      showToast('Condividi questo URL: ' + window.location.href);
    }
  };

  const handleReserve = async () => {
    if (!book) return;

    if (!user) {
      showToast('Per favore, accedi per prenotare questo libro');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (reserving) return;

    if (currentReservation?.status === 'PENDING') {
      showToast('Hai già una richiesta di prenotazione in attesa per questo libro!');
      return;
    }

    setReserving(true);

    try {
      const res = await createReservation(book.id);
      setCurrentReservation(res);
      showToast(`Richiesta di prenotazione inviata per "${book.title}"! Stato: in attesa. 📖`);
    } catch (err: any) {
      console.error('Errore prenotazione:', err);
      showToast(err.message || 'Errore durante la prenotazione del libro');
    } finally {
      setReserving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !book) {
      showToast('Per favore, accedi per scrivere una recensione');
      return;
    }

    if (!formComment.trim()) {
      showToast('Per favore, scrivi qualche parola nel tuo feedback.');
      return;
    }

    setSubmittingReview(true);

    const newFeedback: Feedback = {
      rating: formRating,
      title: formTitle.trim() || 'Recensione del lettore',
      bookId: book.id,
      userId: user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      comment: formComment.trim(),
    };

    try {
      const result = await addFeedback(newFeedback);
      setLocalFeedbacks((prev) => [result, ...prev]);

      // Clear form
      setFormTitle('');
      setFormComment('');
      setFormRating(5);

      showToast('Grazie per la tua recensione! Aggiunta con successo. ✨');
    } catch (error) {
      console.error(error);
      showToast('Errore nel salvataggio della recensione');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render Loading / Error states
  if (loading) {
    return <LoadingBox title="Apertura del volume in corso..." text="Stiamo recuperando i dettagli del libro dalla biblioteca digitale Hubiblio." />
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
              {(() => {
                if (reserving) {
                  return (
                    <button
                      type="button"
                      className={styles.primaryReserveBtn}
                      disabled
                      aria-label="Invio richiesta in corso"
                    >
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Invio richiesta...</span>
                    </button>
                  );
                }

                if (currentReservation?.status === 'PENDING') {
                  return (
                    <button
                      type="button"
                      className={`${styles.primaryReserveBtn} ${styles.reservePending}`}
                      onClick={() => navigate('/my-books')}
                      aria-label="Prenotazione in attesa di approvazione"
                    >
                      <Clock size={18} />
                      <span>Prenotazione in attesa</span>
                    </button>
                  );
                }

                if (currentReservation?.status === 'APPROVED') {
                  return (
                    <button
                      type="button"
                      className={`${styles.primaryReserveBtn} ${styles.reserveApproved}`}
                      onClick={() => navigate('/my-books')}
                      aria-label="Prenotazione approvata, pronto al ritiro"
                    >
                      <CheckCircle2 size={18} />
                      <span>Pronto al ritiro al desk</span>
                    </button>
                  );
                }

                if (currentReservation?.status === 'FULFILLED') {
                  return (
                    <button
                      type="button"
                      className={`${styles.primaryReserveBtn} ${styles.reserveFulfilled}`}
                      onClick={() => navigate('/my-books')}
                      aria-label="Volume attualmente in prestito"
                    >
                      <BookOpen size={18} />
                      <span>In tuo prestito</span>
                    </button>
                  );
                }

                return (
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
                );
              })()}

              {currentReservation?.status === 'PENDING' && (
                <div className={styles.reservationNoticeBox}>
                  <span>Hai una richiesta di prenotazione in attesa per questo volume.</span>
                  <Link to="/my-books" className={styles.reservationNoticeLink}>
                    Visualizza in Le mie prenotazioni →
                  </Link>
                </div>
              )}

              {currentReservation?.status === 'APPROVED' && (
                <div
                  className={styles.reservationNoticeBox}
                  style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}
                >
                  <span>La prenotazione è confermata! Puoi ritirare il libro al desk.</span>
                  <Link
                    to="/my-books"
                    className={styles.reservationNoticeLink}
                    style={{ color: '#047857' }}
                  >
                    Dettagli in Le mie prenotazioni →
                  </Link>
                </div>
              )}

              {currentReservation?.status === 'FULFILLED' && (
                <div
                  className={styles.reservationNoticeBox}
                  style={{ background: '#eef2ff', borderColor: '#c7d2fe', color: '#3730a3' }}
                >
                  <span>Hai questo libro in prestito attivo. Ricordati la data di restituzione.</span>
                  <Link
                    to="/my-books"
                    className={styles.reservationNoticeLink}
                    style={{ color: '#4338ca' }}
                  >
                    Vedi scadenze in Le mie prenotazioni →
                  </Link>
                </div>
              )}

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
                  disabled={submittingReview}
                >
                  <Send size={16} />
                  <span>{submittingReview ? 'Invio in corso...' : 'Invia recensione'}</span>
                </button>
              </form>
            </aside>

            {/* ── Col 2: Reviews List ── */}
            <div className={styles.reviewsListCol}>
              <div className={styles.reviewsListHeader}>
                <h3 className={styles.reviewsCountTitle}>
                  Tutte le recensioni ({sortedFeedbacks.length})
                </h3>
              </div>

              {sortedFeedbacks.length > 0 && (
                sortedFeedbacks.map((feedback, index) => {
                  const firstName = feedback.user?.firstName || 'Lettore';
                  const lastName = feedback.user?.lastName || '';
                  const completeName = `${firstName} ${lastName}`.trim();
                  const initials = `${firstName[0] || 'U'}${lastName[0] || ''}`.toUpperCase();
                  const reviewDate = feedback.createdAt
                    ? new Date(feedback.createdAt).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Di recente';

                  return (
                    <article
                      key={feedback.id || index}
                      className={styles.reviewCard}
                      aria-label={`Recensione di ${completeName}`}
                    >
                      {/* User Header */}
                      <div className={styles.reviewUserRow}>
                        <div className={styles.userInfoLeft}>
                          <div className={styles.userAvatar} aria-hidden="true">
                            {initials}
                          </div>
                          <div className={styles.userNameMeta}>
                            <span className={styles.userName}>
                              {completeName}
                            </span>
                            <span className={styles.userReviewDate}>
                              {reviewDate}
                            </span>
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
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}