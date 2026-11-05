import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, UserPlus, LogIn } from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Catalogo', href: '/#catalog' },
  { label: 'In evidenza', href: '/#featured' },
  // { label: 'Le mie letture', href: '/#my-books' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Chiudi il menu a discesa cliccando fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Disconnessione effettuata con successo.', 'info');
      navigate('/');
    }
  };

  // Calcolo nome visualizzato e iniziali
  const firstName = user?.firstName || user?.user_metadata?.firstName;
  const lastName = user?.lastName || user?.user_metadata?.lastName;

  const displayName = firstName
    ? `${firstName} ${lastName ? lastName[0] + '.' : ''}`.trim()
    : user?.email?.split('@')[0] || 'Utente';

  const fullDisplayName = firstName
    ? `${firstName} ${lastName || ''}`.trim()
    : displayName;

  const initials = firstName
    ? `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.inner} aria-label="Navigazione principale">
        {/* Logo */}
        <Link to="/" aria-label="Hubiblio – home">
          <Logo variant="default" />
        </Link>

        {/* Desktop links */}
        <ul className={styles.links} role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className={styles.link}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.profileContainer} ref={dropdownRef}>
              <button
                type="button"
                className={`${styles.profileBtn} ${dropdownOpen ? styles.profileBtnOpen : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label={`Menu profilo di ${displayName}`}
              >
                <div className={styles.avatar}>{initials}</div>
                <span className={styles.profileName}>{displayName}</span>
                <ChevronDown
                  size={14}
                  className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className={styles.profileDropdown} role="menu">
                  <div className={styles.dropdownUserInfo}>
                    <p className={styles.dropdownUserName}>{fullDisplayName}</p>
                    <p className={styles.dropdownUserEmail}>{user.email}</p>
                  </div>

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Disconnetti</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginBtn}>
                Accedi
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                <UserPlus size={15} />
                <span>Registrati</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-label="Menu mobile">
          <ul role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className={styles.mobileLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.mobileAuthSection}>
            {user ? (
              <>
                <div className={styles.mobileUserCard}>
                  <div className={styles.avatar}>{initials}</div>
                  <div>
                    <p className={styles.dropdownUserName}>{fullDisplayName}</p>
                    <p className={styles.dropdownUserEmail}>{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.mobileLogoutBtn}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Disconnetti</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  to="/login"
                  className={styles.loginBtn}
                  style={{ textAlign: 'center', background: 'var(--neutral-100)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Accedi
                </Link>
                <Link
                  to="/register"
                  className={styles.registerBtn}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <UserPlus size={15} />
                  <span>Registrati</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
