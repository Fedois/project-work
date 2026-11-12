import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  BookMarked,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '../../services/admin.service';
import styles from './Dashboard.module.css';

interface Props {
  onNavigate: (section: 'overview' | 'catalog' | 'reservations' | 'loans') => void;
}

const STAT_CARDS = (s: DashboardStats) => [
  {
    label: 'Libri in catalogo',
    value: s.totalBooks,
    icon: <BookOpen size={22} />,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label: 'Iscritti',
    value: s.totalMembers,
    icon: <Users size={22} />,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    label: 'Prestiti attivi',
    value: s.activeLoans,
    icon: <BookMarked size={22} />,
    iconBg: '#d1fae5',
    iconColor: '#059669',
  },
  {
    label: 'Prestiti scaduti',
    value: s.overdueLoans,
    icon: <AlertTriangle size={22} />,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    label: 'Prenotazioni in attesa',
    value: s.pendingReservations,
    icon: <Clock size={22} />,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
];

export default function DashboardOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center' }}>
        Caricamento statistiche…
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: 32, color: '#dc2626' }}>
        Errore nel caricamento delle statistiche: {error}
      </div>
    );
  }

  const cards = STAT_CARDS(stats);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
          Benvenuto nel pannello di controllo
        </h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '.88rem' }}>
          Qui trovi un riepilogo dello stato della biblioteca.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <TrendingUp size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Azioni rapide
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          {
            title: 'Gestisci catalogo',
            desc: 'Aggiungi, modifica o rimuovi libri',
            section: 'catalog' as const,
            color: '#7c3aed',
            bg: '#ede9fe',
          },
          {
            title: 'Prenotazioni in attesa',
            desc: `${stats.pendingReservations} richieste da gestire`,
            section: 'reservations' as const,
            color: '#d97706',
            bg: '#fef3c7',
          },
          {
            title: 'Prestiti scaduti',
            desc: `${stats.overdueLoans} prestiti oltre la scadenza`,
            section: 'loans' as const,
            color: '#dc2626',
            bg: '#fee2e2',
          },
        ].map((q) => (
          <button
            key={q.title}
            onClick={() => onNavigate(q.section)}
            style={{
              background: '#fff',
              border: '1px solid #f3f4f6',
              borderRadius: 12,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,.07)',
              transition: 'box-shadow .15s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '.9rem', color: '#111827' }}>
                {q.title}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '.78rem', color: '#6b7280' }}>{q.desc}</p>
            </div>
            <ArrowRight size={16} color={q.color} />
          </button>
        ))}
      </div>
    </div>
  );
}

