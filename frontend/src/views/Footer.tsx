import styles from './Footer.module.css';
import Logo from '../components/Logo'
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
              Migliaia di libri a portata di click. Scopri nuovi autori, 
              esplora generi diversi e lasciati sorprendere dalla lettura.
            </p>
          </div>

          {/* Links */}
          <nav className={styles.links} aria-label="Footer navigation">
            {[
              {
                title: 'Biblioteca',
                items: [{title: 'Catalogo', href: '/#catalog'}, {title: 'In evidenza', href: '/#featured'}, {title: 'Le mie prenotazioni', href: '/my-books'}],
              },
              {
                title: 'Privacy',
                items: [{title: 'Privacy Policy', href: '/privacy-policy'}, {title: 'Termini di servizio', href: '/terms-of-service'}, {title: 'Cookie Policy', href: '/cookie-policy'}],
              },
              {
                title: 'Social',
                items: [{title: 'Facebook', href: 'https://facebook.com'}, {title: 'Twitter', href: 'https://twitter.com'}, {title: 'Instagram', href: 'https://instagram.com'}],
              },
            ].map((col) => (
              <div key={col.title} className={styles.linkCol}>
                <h3 className={styles.colTitle}>{col.title}</h3>
                <ul role="list">
                  {col.items.map((item) => (
                    <li key={item.title}>
                      {item.href.includes('#') ? (
                        <a href={item.href} className={styles.colLink}>{item.title}</a>
                      ) : (
                        <Link to={item.href} className={styles.colLink}>{item.title}</Link>
                      )}
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
