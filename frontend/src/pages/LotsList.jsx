import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function LotsList() {
  const [lots, setLots] = useState([]);
  const [filters, setFilters] = useState({ produit: '', origine: '', campagne: '', statut: '' });
  const [loading, setLoading] = useState(true);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const res = await api.get('/lots', { params });
      setLots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const statutColor = (statut) => {
    const colors = {
      VALIDE: '#2e7d32',
      BLOQUE: '#c62828',
      QUARANTAINE: '#f9a825',
      EN_ATTENTE: '#757575',
      RAPPELE: '#6a1b9a',
    };
    return colors[statut] || '#000';
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Registre des lots</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input name="produit" placeholder="Produit" value={filters.produit} onChange={handleFilterChange} />
        <input name="origine" placeholder="Origine" value={filters.origine} onChange={handleFilterChange} />
        <input name="campagne" placeholder="Campagne" value={filters.campagne} onChange={handleFilterChange} />
        <select name="statut" value={filters.statut} onChange={handleFilterChange}>
          <option value="">Tous statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validé</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="QUARANTAINE">Quarantaine</option>
          <option value="RAPPELE">Rappelé</option>
        </select>
        <button onClick={fetchLots}>Filtrer</button>
        <Link to="/lots/nouveau"><button>+ Nouveau lot</button></Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
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
              <tr key={lot.id} style={{ borderBottom: '1px solid #eee' }}>
                <td><Link to={`/lots/${lot.id}`}>{lot.code}</Link></td>
                <td>{lot.produit}</td>
                <td>{lot.origine}</td>
                <td>{lot.campagne}</td>
                <td>{lot.quantite}</td>
                <td style={{ color: statutColor(lot.statut), fontWeight: 'bold' }}>{lot.statut}</td>
                <td>{lot.datePeremption ? new Date(lot.datePeremption).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}