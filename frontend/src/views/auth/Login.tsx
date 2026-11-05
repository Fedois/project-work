import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import LayoutAuth from './LayoutAuth';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthForm.module.css';

export default function Login() {
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //if user is already authenticated redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Inserisci il tuo indirizzo email.');
      return;
    }

    if (!password) {
      setErrorMessage('Inserisci la password.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn({
        email: trimmedEmail,
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Email o password non corretti. Verifica le tue credenziali.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email non confermata. Controlla la tua casella di posta per verificare l’account.';
        } else if (msg.includes('rate limit')) {
          msg = 'Troppi tentativi effettuati. Riprova tra qualche minuto.';
        }
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Si è verificato un errore imprevisto.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAuth
      title="Bentornato"
      subtitle="Accedi al tuo account Hubiblio per gestire i tuoi prestiti e scoprire nuovi libri"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {errorMessage && (
          <div className={styles.alertError} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="login-email" className={styles.label}>
            Email
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Mail size={18} />
            </span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              className={`${styles.input} ${errorMessage && !email ? styles.inputError : ''}`}
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          id="login-submit-btn"
        >
          {loading ? (
            <div className={styles.buttonSpinner} />
          ) : (
            <>
              <LogIn size={18} />
              <span>Accedi</span>
            </>
          )}
        </button>

        <div className={styles.footer}>
          Non hai ancora un account?
          <Link to="/register" className={styles.footerLink}>
            Registrati
          </Link>
        </div>
      </form>
    </LayoutAuth>
  );
}