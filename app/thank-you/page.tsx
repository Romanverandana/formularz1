// /app/thank-you/page.tsx
import styles from './styles.module.css';
import Link from 'next/link';

export default function ThankYouPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Dziękujemy!</h1>
                <p className={styles.message}>Otrzymaliśmy Twoje zapytanie. Skontaktujemy się z Tobą w ciągu 24 godzin z przygotowaną kalkulacją.</p>
                <Link href="/" className={styles.button}>Powrót na stronę główną</Link>
            </div>
        </div>
    );
}