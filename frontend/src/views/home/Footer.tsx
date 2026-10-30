import { BookOpen } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <a href="#" className={styles.logo} aria-label="Hubiblio – torna all'inizio">
              <div className={styles.logoIcon}>
                <BookOpen size={18} strokeWidth={2.2} />
              </div>
              <span className={styles.logoText}>Hubiblio</span>
            </a>
            <p className={styles.brandDesc}>
              La biblioteca digitale che ti avvicina al mondo dei libri.
              Esplora, scopri, prenota.
            </p>
          </div>

          {/* Links */}
          <nav className={styles.links} aria-label="Footer navigation">
            {[
              {
                title: 'Biblioteca',
                items: ['Catalogo', 'In evidenza', 'Le mie letture'],
              },
              {
                title: 'Privacy',
                items: ['Privacy Policy', 'Termini di servizio', 'Cookie Policy'],
              },
              {
                title: 'Social',
                items: ['Facebook', 'Twitter', 'Instagram'],
              },
            ].map((col) => (
              <div key={col.title} className={styles.linkCol}>
                <h3 className={styles.colTitle}>{col.title}</h3>
                <ul role="list">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a href="#" className={styles.colLink}>{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 Hubiblio. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
