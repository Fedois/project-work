import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X, User, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Catalogo', href: '/#catalog' },
  { label: 'In evidenza', href: '/#featured' },
  { label: 'Le mie letture', href: '/#my-books' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.inner} aria-label="Navigazione principale">
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Hubiblio – home">
          <div className={styles.logoIcon}>
            <BookOpen size={20} strokeWidth={2.2} />
          </div>
          <span className={styles.logoText}>Hubiblio</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links} role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className={styles.link}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.profileBtn} aria-label="Profilo utente">
            <div className={styles.avatar}>
              <User size={16} />
            </div>
            <span className={styles.profileName}>Marco R.</span>
            <ChevronDown size={14} />
          </button>

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
                <a href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
