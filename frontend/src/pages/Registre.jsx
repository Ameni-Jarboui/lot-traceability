import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Registre() {
  const [lots, setLots] = useState([]);
  const [filters, setFilters] = useState({ produit: '', origine: '', campagne: '', statut: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(activeFilters) {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLots(activeFilters);
      setLots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleReset() {
    const empty = { produit: '', origine: '', campagne: '', statut: '' };
    setFilters(empty);
    load(empty);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Registre des lots</h1>
          <p>{lots.length} lot(s) affiché(s)</p>
        </div>
        <Link to="/lots/nouveau" className="btn btn-primary">
          + Nouveau lot
        </Link>
      </div>

      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); load(filters); }}>
        <input
          name="produit"
          placeholder="Produit"
          value={filters.produit}
          onChange={handleChange}
        />
        <input
          name="origine"
          placeholder="Origine"
          value={filters.origine}
          onChange={handleChange}
        />
        <input
          name="campagne"
          placeholder="Campagne"
          value={filters.campagne}
          onChange={handleChange}
        />
        <select name="statut" value={filters.statut} onChange={handleChange}>
          <option value="">Tous statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validé</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="QUARANTAINE">Quarantaine</option>
          <option value="RAPPELE">Rappelé</option>
        </select>
        <button className="btn btn-primary">Filtrer</button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Réinitialiser
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">
            <span className="spinner" />
          </div>
        ) : lots.length === 0 ? (
          <div className="empty-state">Aucun lot ne correspond à ces filtres.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Produit</th>
                <th>Origine</th>
                <th>Campagne</th>
                <th>Quantité</th>
                <th>Statut</th>
                <th>Péremption</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <Link to={`/lots/${lot.id}`}>{lot.code}</Link>
                  </td>
                  <td>{lot.produit}</td>
                  <td>{lot.origine}</td>
                  <td>{lot.campagne}</td>
                  <td>{lot.quantite}</td>
                  <td><StatusBadge statut={lot.statut} /></td>
                  <td>
                    {lot.datePeremption
                      ? new Date(lot.datePeremption).toLocaleDateString('fr-FR')
                      : '—'}
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