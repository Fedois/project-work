import styles from './Footer.module.css';
import Logo from '../../components/Logo'
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/"><Logo variant="footer" size={18}/></Link>
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
                items: ['Catalogo', 'In evidenza'],
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
          <p className={styles.copy}>L-31 project work n.22</p>
        </div>
      </div>
    </footer>
  );
}
