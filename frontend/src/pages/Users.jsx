import { useEffect, useState } from 'react';
import { api } from '../api/client';

const ROLES = ['OPERATEUR', 'QUALITE', 'ADMIN'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(userId, role) {
    setSavingId(userId);
    try {
      await api.changerRole(userId, role);
      setUsers((u) => u.map((usr) => (usr.id === userId ? { ...usr, role } : usr)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Utilisateurs</h1>
          <p>Gestion des rôles : opérateur terrain, responsable qualité, administrateur.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">
            <span className="spinner" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Créé le</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
