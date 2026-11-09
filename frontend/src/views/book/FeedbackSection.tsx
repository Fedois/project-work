import { useMemo, useState } from 'react';
import { Star, Send } from 'lucide-react';
import { addFeedback } from '../../services/book.service';
import type { Feedback } from '../../types/books';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import styles from './FeedbackSection.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

const RATING_DESCRIPTORS: Record<number, string> = {
  1: 'Poco convincente',
  2: 'Sotto le aspettative',
  3: 'Nella media / Piacevole',
  4: 'Molto buono e consigliato',
  5: 'Eccellente! Un must-read assoluto',
};

export interface ReviewStats {
  average: string;
  count: number;
  distribution: Record<number, number>;
}

interface FeedbackSectionProps {
  bookId: string;
  feedbacks: Feedback[];
  stats: ReviewStats;
  onFeedbackAdded: (feedback: Feedback) => void;
}

export default function FeedbackSection({ bookId, feedbacks, stats, onFeedbackAdded }: FeedbackSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Navigate
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Feedbacks ordered from most recent to least recent
  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [feedbacks]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Per favore, accedi per scrivere una recensione');
      navigate('/login', { state: { from: location } });
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
      bookId,
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
      onFeedbackAdded(result);

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

  return (
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
        <div className={styles.overallScoreCard}>
          <span className={styles.hugeRatingNum}>{stats.average}</span>
          <div
            className={styles.overallStars}
            aria-label={`Valutazione media: ${stats.average} stelle su 5`}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                fill={s <= Math.round(Number(stats.average)) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className={styles.overallCountText}>Basato su {stats.count} recensioni</span>
        </div>

        <div className={styles.distributionBars} aria-label="Distribuzione delle valutazioni">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percent = stats.distribution[stars] || 0;
            return (
              <div key={stars} className={styles.barRow}>
                <div className={styles.starLabel}>
                  <span>{stars}</span>
                  <Star size={13} fill="currentColor" color="var(--gold-500)" />
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percent}%` }} />
                </div>
                <span className={styles.barPercent}>{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Content Grid: Form (Col 1) and Reviews List (Col 2) */}
      <div className={styles.reviewsContentGrid}>
        {/* ── Col 1: Review Form ── */}
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
              <span className={styles.charCount}>{formComment.length} / 1000 caratteri</span>
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

          {sortedFeedbacks.map((feedback, index) => {
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
                <div className={styles.reviewUserRow}>
                  <div className={styles.userInfoLeft}>
                    <div className={styles.userAvatar} aria-hidden="true">
                      {initials}
                    </div>
                    <div className={styles.userNameMeta}>
                      <span className={styles.userName}>{completeName}</span>
                      <span className={styles.userReviewDate}>{reviewDate}</span>
                    </div>
                  </div>

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

                {feedback.title && <h4 className={styles.reviewTitle}>{feedback.title}</h4>}
                <p className={styles.reviewBodyText}>{feedback.comment}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}