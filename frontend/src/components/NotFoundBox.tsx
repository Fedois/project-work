import styles from './NotFoundBox.module.css'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundBox({title, subtitle, backTo, backToLabel}: {title: string, subtitle: string, backTo: string, backToLabel: string}){
    return (
        <div className={styles.stateContainer}>
          <h2 className={styles.stateTitle}>{title}</h2>
          <p className={styles.stateText}>{subtitle}</p>
          <Link to={backTo} className={styles.backButton}>
            <ArrowLeft size={16} /> {backToLabel}
          </Link>
        </div>
    );
}