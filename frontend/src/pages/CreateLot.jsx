import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function CreateLot() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    produit: '',
    origine: '',
    campagne: '',
    quantite: '',
    datePeremption: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const quantite = Number(form.quantite);
    if (quantite < 0) {
      setError('La quantité ne peut pas être négative.');
      return;
    }

    setLoading(true);
    try {
      const lot = await api.createLot({ ...form, quantite });
      navigate(`/lots/${lot.id}`);
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
          <h1>Réception d'un nouveau lot</h1>
          <p>Un code unique et un QR code seront générés automatiquement côté serveur.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="field">
            <label>Produit</label>
            <input
              value={form.produit}
              onChange={(e) => update('produit', e.target.value)}
              placeholder="Huile d'olive extra vierge"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Origine</label>
              <input
                value={form.origine}
                onChange={(e) => update('origine', e.target.value)}
                placeholder="Sfax, Tunisie"
                required
              />
            </div>
            <div className="field">
              <label>Campagne</label>
              <input
                value={form.campagne}
                onChange={(e) => update('campagne', e.target.value)}
                placeholder="2025/2026"
                required
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Quantité (kg / L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.quantite}
                onChange={(e) => update('quantite', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Date de péremption (optionnel)</label>
              <input
                type="date"
                value={form.datePeremption}
                onChange={(e) => update('datePeremption', e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Créer le lot'}
          </button>
        </form>
      </div>
    </div>
  );
}
