import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Recombiner() {
  const navigate = useNavigate();
  const [idsRaw, setIdsRaw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const lotIds = idsRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (lotIds.length < 2) {
      setError('Indiquez au moins deux identifiants de lots (un par ligne).');
      return;
    }

    setLoading(true);
    try {
      const lot = await api.recombinerLots(lotIds);
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
          <h1>Recombiner des lots</h1>
          <p>
            Fusionne plusieurs lots fractionnés du même produit en un seul lot, en conservant la
            traçabilité vers chaque lot source.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="field">
            <label>Identifiants des lots à recombiner (un par ligne)</label>
            <textarea
              rows={6}
              value={idsRaw}
              onChange={(e) => setIdsRaw(e.target.value)}
              placeholder={'ex: 3f2a1c9d-...\nex: 8b7e6a2f-...'}
              required
            />
            <span className="hint">
              Copiez l'identifiant (ID) de chaque lot depuis sa fiche de détail. Les lots doivent
              être du même produit, ni bloqués, ni rappelés.
            </span>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Recombiner'}
          </button>
        </form>
      </div>
    </div>
  );
}
