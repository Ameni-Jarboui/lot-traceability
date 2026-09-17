import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">Lots Traçabilité</div>
        <div className="auth-sub">Connexion à votre espace de suivi de lots</div>

        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>Adresse email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operateur@zen.tn"
            required
          />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Se connecter'}
        </button>

        <p className="hint" style={{ marginTop: 16, textAlign: 'center' }}>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
