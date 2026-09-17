import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ produit: '', origine: '', campagne: '', statut: '' });
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLots(filters);
      setLots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Registre des lots</h1>
          <p>Suivi de tous les lots depuis la réception jusqu'à l'expédition.</p>
        </div>
        <Link to="/lots/nouveau" className="btn btn-primary">
          + Nouveau lot
        </Link>
      </div>

      <form className="filters-bar" onSubmit={handleFilterSubmit}>
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
        <select
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="">Tous statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validé</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="QUARANTAINE">Quarantaine</option>
          <option value="RAPPELE">Rappelé</option>
        </select>
        <button className="btn btn-secondary">Filtrer</button>
      </form>

      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">
            <span className="spinner" />
          </div>
        ) : lots.length === 0 ? (
          <div className="empty-state">Aucun lot ne correspond à ces critères pour l'instant.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Produit</th>
                <th>Origine</th>
                <th>Campagne</th>
                <th>Quantité</th>
                <th>Péremption</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="row-link" onClick={() => navigate(`/lots/${lot.id}`)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{lot.code}</td>
                  <td>{lot.produit}</td>
                  <td>{lot.origine}</td>
                  <td>{lot.campagne}</td>
                  <td>{lot.quantite}</td>
                  <td>
                    {lot.datePeremption
                      ? new Date(lot.datePeremption).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td>
                    <StatusBadge statut={lot.statut} />
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
