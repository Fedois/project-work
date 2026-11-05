import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import LayoutAuth from './LayoutAuth';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthForm.module.css';

export default function Register() {
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Se l'utente è già autenticato, reindirizza alla home
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setConfirmationNotice(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage('Inserisci il tuo nome e cognome.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La password deve contenere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono.');
      return;
    }

    setLoading(true);

    try {
      const { session, confirmationRequired, error } = await signUp({
        email: trimmedEmail,
        password,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('already registered') || msg.includes('unique constraint')) {
          msg = 'Questo indirizzo email è già registrato. Prova ad effettuare il login.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'La password deve contenere almeno 6 caratteri.';
        }
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      if (confirmationRequired) {
        setConfirmationNotice(
          `Ti abbiamo inviato un'email di conferma all'indirizzo ${trimmedEmail}. Clicca sul link nell'email per attivare il tuo account prima di accedere.`
        );
      } else if (session) {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Si è verificato un errore durante la registrazione.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAuth
      title="Crea il tuo account"
      subtitle="Unisciti a Hubiblio per accedere al catalogo digitale, prenotare letture e gestire la tua libreria"
    >
      {confirmationNotice ? (
        <div className={styles.form}>
          <div className={styles.alertSuccess} role="status">
            <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Conferma la tua email</strong>
              <p>{confirmationNotice}</p>
            </div>
          </div>

          <Link to="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
            Vai alla pagina di Login
          </Link>

          <div className={styles.footer}>
            Non hai ricevuto l’email? Controlla la cartella spam o{' '}
            <button
              type="button"
              className={styles.footerLink}
              onClick={() => setConfirmationNotice(null)}
            >
              riprova con un altro indirizzo
            </button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-first-name" className={styles.label}>
                Nome
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <UserIcon size={18} />
                </span>
                <input
                  id="reg-first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  className={styles.input}
                  placeholder="Mario"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="reg-last-name" className={styles.label}>
                Cognome
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <UserIcon size={18} />
                </span>
                <input
                  id="reg-last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  className={styles.input}
                  placeholder="Rossi"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                className={styles.input}
                placeholder="mario.rossi@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-password" className={styles.label}>
              Password <span style={{ fontWeight: 400, color: 'var(--neutral-400)', fontSize: 12 }}>(min. 6 caratteri)</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
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

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-confirm-password" className={styles.label}>
              Conferma password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <div className={styles.buttonSpinner} />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Crea account</span>
              </>
            )}
          </button>

          <div className={styles.footer}>
            Hai già un account?
            <Link to="/login" className={styles.footerLink}>
              Accedi
            </Link>
          </div>
        </form>
      )}
    </LayoutAuth>
  );
}