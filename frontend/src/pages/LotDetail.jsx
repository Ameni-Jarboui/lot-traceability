import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const MOUVEMENT_LABELS = {
  RECEPTION: 'Réception',
  TRANSFORMATION: 'Transformation',
  FRACTIONNEMENT: 'Fractionnement',
  RECOMBINAISON: 'Recombinaison',
  STOCKAGE: 'Stockage',
  EXPEDITION: 'Expédition',
};

export default function LotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lot, setLot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [docForm, setDocForm] = useState({ nom: '', url: '', dateExpiration: '' });
  const [docMsg, setDocMsg] = useState('');
  const [docSaving, setDocSaving] = useState(false);

  const [rappelMotif, setRappelMotif] = useState('');
  const [rappelMsg, setRappelMsg] = useState('');
  const [rappelSaving, setRappelSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLot(id);
      setLot(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddDocument(e) {
    e.preventDefault();
    setDocMsg('');
    setDocSaving(true);
    try {
      await api.ajouterDocument(id, docForm);
      setDocForm({ nom: '', url: '', dateExpiration: '' });
      setDocMsg('Document ajouté.');
      load();
    } catch (err) {
      setDocMsg(err.message);
    } finally {
      setDocSaving(false);
    }
  }

  async function handleRappel(e) {
    e.preventDefault();
    setRappelMsg('');
    setRappelSaving(true);
    try {
      const res = await api.lancerRappel(id, rappelMotif);
      setRappelMsg(`Rappel lancé — ${res.lotsAffectes.length} lot(s) affecté(s).`);
      load();
    } catch (err) {
      setRappelMsg(err.message);
    } finally {
      setRappelSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner" />
      </div>
    );
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!lot) return null;

  const canManage = ['OPERATEUR', 'ADMIN'].includes(user.role);
  const canRappel = ['QUALITE', 'ADMIN'].includes(user.role);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{lot.produit}</h1>
          <p style={{ fontFamily: 'var(--font-mono)' }}>{lot.code}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <StatusBadge statut={lot.statut} />
          {canManage && lot.statut !== 'RAPPELE' && (
            <Link to={`/lots/${lot.id}/fractionner`} className="btn btn-secondary">
              Fractionner
            </Link>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="section-title">
              <h3>Historique du lot</h3>
            </div>
            {lot.mouvements?.length ? (
              <ul className="timeline">
                {lot.mouvements.map((m) => (
                  <li className="timeline-item" key={m.id}>
                    <div className="t-type">{MOUVEMENT_LABELS[m.type] || m.type}</div>
                    <div className="t-date">
                      {new Date(m.createdAt).toLocaleString('fr-FR')}
                    </div>
                    {m.details && <div className="t-details">{m.details}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">Aucun mouvement enregistré.</p>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>Contrôles qualité</h3>
              <Link to={`/controle-terrain?code=${lot.code}`} className="btn btn-secondary">
                Nouveau contrôle
              </Link>
            </div>
            {lot.controles?.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Résultat</th>
                    <th>Temp.</th>
                    <th>Acidité</th>
                    <th>Humidité</th>
                    <th>Validé</th>
                  </tr>
                </thead>
                <tbody>
                  {lot.controles.map((c) => (
                    <tr key={c.id}>
                      <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>{c.resultat}</td>
                      <td>{c.temperature ?? '—'}</td>
                      <td>{c.aciditee ?? '—'}</td>
                      <td>{c.humidite ?? '—'}</td>
                      <td>{c.valide ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="hint">Aucun contrôle enregistré pour ce lot.</p>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>Documents & certificats</h3>
            </div>
            {lot.documents?.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Version</th>
                    <th>Expiration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lot.documents.map((d) => {
                    const expire = d.dateExpiration && new Date(d.dateExpiration) < new Date();
                    return (
                      <tr key={d.id}>
                        <td>{d.nom}</td>
                        <td>v{d.version}</td>
                        <td>
                          {d.dateExpiration
                            ? new Date(d.dateExpiration).toLocaleDateString('fr-FR')
                            : '—'}
                          {expire && (
                            <span className="badge badge-bloque" style={{ marginLeft: 8 }}>
                              Expiré
                            </span>
                          )}
                        </td>
                        <td>
                          <a href={d.url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                            Voir
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="hint">Aucun document associé.</p>
            )}

            {canManage && (
              <form onSubmit={handleAddDocument} style={{ marginTop: 16 }}>
                {docMsg && <p className="hint">{docMsg}</p>}
                <div className="field-row">
                  <div className="field">
                    <label>Nom du document</label>
                    <input
                      value={docForm.nom}
                      onChange={(e) => setDocForm({ ...docForm, nom: e.target.value })}
                      placeholder="Certificat d'analyse"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>URL / lien du fichier</label>
                    <input
                      value={docForm.url}
                      onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Date d'expiration (optionnel)</label>
                    <input
                      type="date"
                      value={docForm.dateExpiration}
                      onChange={(e) => setDocForm({ ...docForm, dateExpiration: e.target.value })}
                    />
                  </div>
                </div>
                <button className="btn btn-secondary" disabled={docSaving}>
                  {docSaving ? <span className="spinner" /> : 'Ajouter le document'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Identité</h3>
            <dl className="kv">
              <dt>Origine</dt>
              <dd>{lot.origine}</dd>
              <dt>Campagne</dt>
              <dd>{lot.campagne}</dd>
              <dt>Quantité</dt>
              <dd>{lot.quantite}</dd>
              <dt>Péremption</dt>
              <dd>
                {lot.datePeremption
                  ? new Date(lot.datePeremption).toLocaleDateString('fr-FR')
                  : '—'}
              </dd>
              {lot.parent && (
                <>
                  <dt>Lot parent</dt>
                  <dd>
                    <Link to={`/lots/${lot.parent.id}`}>{lot.parent.code}</Link>
                  </dd>
                </>
              )}
            </dl>

            {lot.qrCodeUrl && (
              <div style={{ marginTop: 16 }}>
                <div className="qr-box">
                  <img src={lot.qrCodeUrl} alt={`QR code ${lot.code}`} />
                </div>
              </div>
            )}
          </div>

          {lot.enfants?.length > 0 && (
            <div className="card">
              <h3>Lots enfants ({lot.enfants.length})</h3>
              <div className="tag-row">
                {lot.enfants.map((e) => (
                  <Link key={e.id} to={`/lots/${e.id}`} className="btn btn-secondary">
                    {e.code}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {canRappel && lot.statut !== 'RAPPELE' && (
            <div className="card">
              <h3>Rappel de lot</h3>
              <p className="hint">
                Bloque ce lot et tous ses descendants, et identifie les clients concernés.
              </p>
              <form onSubmit={handleRappel}>
                {rappelMsg && <p className="hint">{rappelMsg}</p>}
                <div className="field">
                  <label>Motif du rappel</label>
                  <textarea
                    rows={3}
                    value={rappelMotif}
                    onChange={(e) => setRappelMotif(e.target.value)}
                    placeholder="Non-conformité détectée lors du contrôle qualité"
                    required
                  />
                </div>
                <button className="btn btn-danger" disabled={rappelSaving}>
                  {rappelSaving ? <span className="spinner" /> : 'Lancer le rappel'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
