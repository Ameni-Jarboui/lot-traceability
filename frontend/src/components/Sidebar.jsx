import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Registre des lots', icon: '◧', roles: ['OPERATEUR', 'QUALITE', 'ADMIN'] },
  { to: '/lots/nouveau', label: 'Nouveau lot', icon: '＋', roles: ['OPERATEUR', 'ADMIN'] },
  { to: '/recombiner', label: 'Recombiner des lots', icon: '⇄', roles: ['OPERATEUR', 'ADMIN'] },
  { to: '/controle-terrain', label: 'Contrôle terrain', icon: '◎', roles: ['OPERATEUR', 'QUALITE', 'ADMIN'] },
  { to: '/rappels', label: 'Rappels', icon: '⚑', roles: ['QUALITE', 'ADMIN'] },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: '☰', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleLinks = LINKS.filter((l) => l.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Lots Traçabilité
        <span>Producteur → produit fini</span>
      </div>

      <nav className="sidebar-nav">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <b>{user.nom}</b>
          {user.email}
          <div>
            <span className="sidebar-role">{user.role}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
