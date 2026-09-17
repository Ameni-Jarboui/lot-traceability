import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ScanControle() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [form, setForm] = useState({
    temperature: '',
    aciditee: '',
    humidite: '',
    photoUrl: '',
    latitude: '',
    longitude: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function captureGeoloc() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude.toFixed(6));
        update('longitude', pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError('Impossible de récupérer la position (autorisation refusée ?).');
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!code.trim()) {
      setError('Le code du lot est requis (scanné ou saisi manuellement).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        temperature: form.temperature ? Number(form.temperature) : null,
        aciditee: form.aciditee ? Number(form.aciditee) : null,
        humidite: form.humidite ? Number(form.humidite) : null,
        photoUrl: form.photoUrl || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const res = await api.creerControleParCode(code.trim(), payload);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const resultatStyle = result?.evaluation?.conforme
    ? 'success-box'
    : 'error-box';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Contrôle terrain</h1>
          <p>
            Saisissez le code du lot (ou collez-le après un scan QR) puis les mesures relevées sur
            le terrain.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label>Code du lot</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="HUI-LX3F9K-A2B7"
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
              <span className="hint">
                En attendant l'intégration d'un scanner caméra, collez ici le code lu sur le QR.
              </span>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Température (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={(e) => update('temperature', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Acidité</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.aciditee}
                  onChange={(e) => update('aciditee', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Humidité (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.humidite}
                  onChange={(e) => update('humidite', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Photo (URL, optionnel)</label>
              <input
                value={form.photoUrl}
                onChange={(e) => update('photoUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="field">
              <label>Géolocalisation (optionnel)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => update('latitude', e.target.value)}
                />
                <input
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => update('longitude', e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={captureGeoloc} disabled={locating}>
                  {locating ? <span className="spinner" /> : 'Capturer'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Enregistrer le contrôle'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="card">
              <h3>Résultat</h3>
              <div className={resultatStyle}>
                {result.evaluation.conforme
                  ? 'Lot conforme.'
                  : 'Lot non conforme — voir les raisons ci-dessous.'}
              </div>
              {result.evaluation.raisons?.length > 0 && (
                <ul>
                  {result.evaluation.raisons.map((r, i) => (
                    <li key={i} className="hint">
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              <dl className="kv" style={{ marginTop: 12 }}>
                <dt>Résultat enregistré</dt>
                <dd>{result.controle.resultat}</dd>
              </dl>
            </div>
          ) : (
            <div className="card empty-state">Le résultat du contrôle s'affichera ici.</div>
          )}
        </div>
      </div>
    </div>
  );
}
