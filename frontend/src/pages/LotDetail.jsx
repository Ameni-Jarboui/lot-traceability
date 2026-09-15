import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function LotDetail() {
  const { id } = useParams();
  const [lot, setLot] = useState(null);

  useEffect(() => {
    api.get(`/lots/${id}`).then((res) => setLot(res.data));
  }, [id]);

  if (!lot) return <p style={{ padding: 20 }}>Chargement...</p>;

  // Fusionne mouvements + contrôles dans une timeline triée
  const events = [
    ...lot.mouvements.map((m) => ({ ...m, kind: 'mouvement' })),
    ...lot.controles.map((c) => ({ ...c, kind: 'controle' })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>{lot.code}</h2>
      <p><b>Produit:</b> {lot.produit} | <b>Origine:</b> {lot.origine} | <b>Statut:</b> {lot.statut}</p>
      {lot.qrCodeUrl && <img src={lot.qrCodeUrl} alt="QR code" width={150} />}

      {lot.parent && <p>↑ Issu du lot parent: <a href={`/lots/${lot.parent.id}`}>{lot.parent.code}</a></p>}
      {lot.enfants?.length > 0 && (
        <div>
          <b>Lots enfants :</b>
          <ul>{lot.enfants.map((e) => <li key={e.id}><a href={`/lots/${e.id}`}>{e.code}</a></li>)}</ul>
        </div>
      )}

      <h3>Timeline</h3>
      <div style={{ borderLeft: '2px solid #ccc', paddingLeft: 16 }}>
        {events.map((event, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#888' }}>
              {new Date(event.createdAt).toLocaleString()}
            </div>
            {event.kind === 'mouvement' ? (
              <div><b>{event.type}</b> — {event.details}</div>
            ) : (
              <div>
                <b>Contrôle qualité</b> — {event.resultat}
                {event.temperature != null && ` | Temp: ${event.temperature}°C`}
                {event.aciditee != null && ` | Acidité: ${event.aciditee}`}
                {event.humidite != null && ` | Humidité: ${event.humidite}%`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}