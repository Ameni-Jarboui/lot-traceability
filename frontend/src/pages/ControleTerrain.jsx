/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react';
import QrScanner from '../components/QrScanner';
import api from '../api/client';
import { savePendingControle, getPendingControles, deletePendingControle, countPending } from '../utils/offlineDb';
import { useOnlineStatus } from '../utils/useOnlineStatus';

export default function ControleTerrain() {
  const [step, setStep] = useState('scan'); // scan | form | done
  const [lotCode, setLotCode] = useState('');
  const [form, setForm] = useState({ temperature: '', aciditee: '', humidite: '' });
  const [message, setMessage] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    refreshPendingCount();
  }, []);

  useEffect(() => {
    if (isOnline) syncPendingControles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const refreshPendingCount = async () => {
    setPendingCount(await countPending());
  };

  const handleScan = async (code) => {
    setLotCode(code);
    setStep('form');
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const geo = await getCurrentLocation();
    const payload = {
      lotCode,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      aciditee: form.aciditee ? parseFloat(form.aciditee) : null,
      humidite: form.humidite ? parseFloat(form.humidite) : null,
      ...geo,
    };

    if (!navigator.onLine) {
      // Mode hors-ligne : sauvegarde locale
      await savePendingControle(payload);
      setMessage('📴 Hors-ligne : contrôle sauvegardé localement, sera synchronisé automatiquement.');
      await refreshPendingCount();
    } else {
      try {
        await api.post(`/controles/by-code/${lotCode}`, payload);
        setMessage('✅ Contrôle envoyé avec succès.');
      } catch {
        // Si l'envoi échoue malgré "online" (ex: mauvaise connexion), on sauvegarde quand même
        await savePendingControle(payload);
        setMessage('⚠️ Échec envoi, sauvegardé localement pour réessai.');
        await refreshPendingCount();
      }
    }
    setStep('done');
  };

  const syncPendingControles = async () => {
    const pending = await getPendingControles();
    for (const item of pending) {
      try {
        await api.post(`/controles/by-code/${item.lotCode}`, item);
        await deletePendingControle(item.localId);
      } catch {
        // Sync échouée pour cet item, on réessaiera au prochain retour en ligne
      }
    }
    await refreshPendingCount();
  };

  return (
    <div className="scan-shell">
      <div className="status-pill">
        <span className={isOnline ? 'dot-online' : 'dot-offline'}></span>
        {isOnline ? 'En ligne' : 'Hors-ligne'}
        {pendingCount > 0 && ` — ${pendingCount} en attente`}
      </div>

      {step === 'scan' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Scanner un lot</h3>
          <QrScanner onScan={handleScan} onClose={() => {}} />
        </div>
      )}

      {step === 'form' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Contrôle — {lotCode}</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Température (°C)</label>
              <input
                className="input"
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Acidité</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.aciditee}
                onChange={(e) => setForm({ ...form, aciditee: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Humidité (%)</label>
              <input
                className="input"
                type="number"
                step="0.1"
                value={form.humidite}
                onChange={(e) => setForm({ ...form, humidite: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit">
              Valider le contrôle
            </button>
          </form>
        </div>
      )}

      {step === 'done' && (
        <div className="card">
          <p>{message}</p>
          <button
            className="btn btn-outline btn-full"
            onClick={() => {
              setStep('scan');
              setForm({ temperature: '', aciditee: '', humidite: '' });
            }}
          >
            Scanner un autre lot
          </button>
        </div>
      )}
    </div>
  );
}
