import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Fractionner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [fractions, setFractions] = useState([{ quantite: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getLot(id).then(setLot).catch((err) => setError(err.message));
  }, [id]);

  function updateFraction(index, value) {
    setFractions((f) => f.map((frac, i) => (i === index ? { quantite: value } : frac)));
  }

  function addRow() {
    setFractions((f) => [...f, { quantite: '' }]);
  }

  function removeRow(index) {
    setFractions((f) => f.filter((_, i) => i !== index));
  }

  const total = fractions.reduce((sum, f) => sum + (Number(f.quantite) || 0), 0);
  const depasse = lot && total > lot.quantite;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const parsed = fractions.map((f) => ({ quantite: Number(f.quantite) }));
    if (parsed.some((f) => !f.quantite || f.quantite <= 0)) {
      setError('Chaque fraction doit avoir une quantité strictement positive.');
      return;
    }
    if (depasse) {
      setError('La somme des fractions dépasse la quantité du lot parent.');
      return;
    }

    setLoading(true);
    try {
      await api.fractionnerLot(id, parsed);
      navigate(`/lots/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!lot && !error) {
    return (
      <div className="empty-state">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Fractionner un lot</h1>
          {lot && (
            <p>
              Lot parent <b>{lot.code}</b> — quantité disponible : {lot.quantite}
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          {fractions.map((f, i) => (
            <div className="field-row" key={i}>
              <div className="field">
                <label>Fraction {i + 1} — quantité</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={f.quantite}
                  onChange={(e) => updateFraction(i, e.target.value)}
                  required
                />
              </div>
              {fractions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ alignSelf: 'flex-end', marginBottom: 14 }}
                  onClick={() => removeRow(i)}
                >
                  Retirer
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addRow} style={{ marginBottom: 16 }}>
            + Ajouter une fraction
          </button>

          <p className={depasse ? 'error-box' : 'hint'}>
            Total des fractions : {total} {lot ? `/ ${lot.quantite}` : ''}
          </p>

          <button className="btn btn-primary" disabled={loading || depasse}>
            {loading ? <span className="spinner" /> : 'Valider le fractionnement'}
          </button>
        </form>
      </div>
    </div>
  );
}
