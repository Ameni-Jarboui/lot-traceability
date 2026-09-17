import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card" style={{ margin: 40 }}>
        <h2>Accès refusé</h2>
        <p>Votre rôle ({user.role}) ne permet pas d'accéder à cette page.</p>
      </div>
    );
  }

  return children;
}
