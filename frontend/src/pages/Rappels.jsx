import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Rappels() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ produit: '', origine: '', campagne: '' });
  const [lots, setLots] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.getLots(filters);
      setLots(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Rappels</h1>
          <p>
            Recherchez le lot concerné pour lancer un rappel ciblé — la fiche du lot identifie
            automatiquement tous ses descendants.
          </p>
        </div>
      </div>

      <form className="filters-bar" onSubmit={handleSearch}>
        <input
          placeholder="Produit"
          value={filters.produit}
          onChange={(e) => setFilters({ ...filters, produit: e.target.value })}
        />
        <input
          placeholder="Origine"
          value={filters.origine}
          onChange={(e) => setFilters({ ...filters, origine: e.target.value })}
        />
        <input
          placeholder="Campagne"
          value={filters.campagne}
          onChange={(e) => setFilters({ ...filters, campagne: e.target.value })}
        />
        <button className="btn btn-primary">Rechercher</button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {searched && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="empty-state">
              <span className="spinner" />
            </div>
          ) : lots.length === 0 ? (
            <div className="empty-state">Aucun lot trouvé.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Produit</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{lot.code}</td>
                    <td>{lot.produit}</td>
                    <td>{lot.statut}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/lots/${lot.id}`)}
                      >
                        Ouvrir la fiche
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
