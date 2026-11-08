import styles from './LoadingBox.module.css';

export default function LoadingBox({ title, text }: { title: string, text: string }) {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.stateContainer}>
        <div className={styles.spinner} role="status" aria-label={title}/>
        <h2 className={styles.stateTitle}>{title}</h2>
        <p className={styles.stateText}>{text}</p>
      </div>
    </main>
  );
}