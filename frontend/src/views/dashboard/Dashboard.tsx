import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BookMarked,
  Menu,
  X,
  LogOut,
  Library,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import DashboardOverview from './DashboardOverview';
import CatalogManagement from './CatalogManagement';
import ReservationsManagement from './ReservationsManagement';
import LoansManagement from './LoansManagement';

type DashboardSection = 'overview' | 'catalog' | 'reservations' | 'loans';

const NAV_ITEMS: {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'overview', label: 'Panoramica', icon: <LayoutDashboard size={16} /> },
  { id: 'catalog', label: 'Catalogo', icon: <BookOpen size={16} /> },
  { id: 'reservations', label: 'Prenotazioni', icon: <ClipboardList size={16} /> },
  { id: 'loans', label: 'Prestiti', icon: <BookMarked size={16} /> },
];

const SECTION_TITLES: Record<DashboardSection, string> = {
  overview: 'Panoramica',
  catalog: 'Gestione Catalogo',
  reservations: 'Gestione Prenotazioni',
  loans: 'Gestione Prestiti',
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Disconnessione effettuata.', 'info');
      navigate('/');
    }
  };

  const firstName = user?.firstName || user?.user_metadata?.firstName || '';
  const lastName = user?.lastName || user?.user_metadata?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'A';
  const fullName = `${firstName} ${lastName}`.trim() || user?.email || 'Amministratore';

  return (
    <div className={styles.dashboardLayout}>
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
        aria-label="Navigazione dashboard"
      >
        <div className={styles.sidebarLogo}>
          <p className={styles.sidebarTitle}>
            <Library size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Hubiblio
          </p>
          <p className={styles.sidebarSubtitle}>Pannello Bibliotecario</p>
        </div>

        <nav className={styles.sidebarNav}>
          <p className={styles.navSection}>Navigazione</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ marginBottom: 10, fontSize: '.8rem', color: '#a5b4fc' }}>
            <strong style={{ color: '#e0e7ff', display: 'block' }}>{fullName}</strong>
            {user?.role}
          </div>
          <button
            className={`${styles.navItem}`}
            style={{ padding: '8px 0', color: '#f87171' }}
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Disconnetti
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h1 className={styles.topBarTitle}>{SECTION_TITLES[activeSection]}</h1>
          <div className={styles.topBarUser}>
            <div className={styles.topBarAvatar}>{initials}</div>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <strong style={{ color: '#111827', fontSize: '.84rem' }}>{fullName}</strong>
              <span style={{ fontSize: '.72rem' }}>{user?.role}</span>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {activeSection === 'overview' && (
            <DashboardOverview onNavigate={setActiveSection} />
          )}
          {activeSection === 'catalog' && <CatalogManagement />}
          {activeSection === 'reservations' && (
            <ReservationsManagement onNavigateToLoans={() => setActiveSection('loans')} />
          )}
          {activeSection === 'loans' && <LoansManagement />}
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Chiudi menu' : 'Apri menu'}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </div>
  );
}

