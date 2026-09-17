const LABELS = {
  EN_ATTENTE: 'En attente',
  VALIDE: 'Validé',
  BLOQUE: 'Bloqué',
  QUARANTAINE: 'Quarantaine',
  RAPPELE: 'Rappelé',
};

export default function StatusBadge({ statut }) {
  const cls = `badge badge-${(statut || 'en_attente').toLowerCase()}`;
  return <span className={cls}>{LABELS[statut] || statut}</span>;
}
