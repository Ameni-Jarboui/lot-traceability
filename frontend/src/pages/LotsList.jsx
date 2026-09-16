/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatutBadge from '../components/StatutBadge';

const STATUTS = [
  ['', 'Tous statuts'],
  ['RECEPTION', 'Réception'],
  ['EN_CONTROLE', 'En contrôle'],
  ['QUARANTAINE', 'Quarantaine'],
  ['ACCEPTE', 'Accepté'],
  ['EN_TRANSFORMATION', 'Transformation'],
  ['CONDITIONNE', 'Conditionné'],
  ['STOCKE', 'En stock'],
  ['EXPEDIE', 'Expédié'],
  ['RAPPELE', 'Rappelé'],
  ['REJETE', 'Rejeté'],
];

export default function LotsList() {
  const [lots, setLots] = useState([]);
  const [filters, setFilters] = useState({ produit: '', origine: '', campagne: '', statut: '' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLots = async (activeFilters) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v));
      const res = await api.get('/lots', { params });
      setLots(res.data);
    } catch {
      setErrorMsg("Impossible de charger le registre. Vérifiez la connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots(filters);
    // chargement initial uniquement — le filtrage se fait via le bouton "Filtrer"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Registre des lots</h1>
        <Link to="/lots/nouveau"><button className="btn">Nouveau lot</button></Link>
      </div>

      <div className="filters">
        <input
          className="field"
          name="produit"
          placeholder="Produit"
          value={filters.produit}
          onChange={handleFilterChange}
        />
        <input
          className="field"
          name="origine"
          placeholder="Origine"
          value={filters.origine}
          onChange={handleFilterChange}
        />
        <input
          className="field"
          name="campagne"
          placeholder="Campagne"
          value={filters.campagne}
          onChange={handleFilterChange}
        />
        <select className="field" name="statut" value={filters.statut} onChange={handleFilterChange}>
          {STATUTS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="btn secondary" onClick={() => fetchLots(filters)}>Filtrer</button>
      </div>

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      {loading ? (
        <p style={{ color: 'var(--ink-soft)' }}>Chargement du registre…</p>
      ) : lots.length === 0 ? (
        <div className="empty-state">Aucun lot ne correspond à ces filtres.</div>
      ) : (
        <table className="registry">
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
                <td data-label="Code"><Link to={`/lots/${lot.id}`} className="lot-code">{lot.code}</Link></td>
                <td data-label="Produit">{lot.produit}</td>
                <td data-label="Origine">{lot.origine}</td>
                <td data-label="Campagne">{lot.campagne}</td>
                <td data-label="Quantité" className="qty">{lot.quantite} {lot.unite}</td>
                <td data-label="Statut"><StatutBadge statut={lot.statut} /></td>
                <td data-label="Péremption">
                  {lot.datePeremption ? new Date(lot.datePeremption).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
