// Aligné sur `enum StatutLot` de prisma/schema.prisma.
// L'ancienne version listait EN_ATTENTE_CONTROLE / EN_STOCK / CONTRE_ANALYSE, qui
// n'existent pas côté base — l'API aurait renvoyé un statut jamais reconnu ici.
const CONFIG = {
  RECEPTION:          { label: 'Réception',        tone: 'info' },
  EN_CONTROLE:        { label: 'En contrôle',      tone: 'warn' },
  QUARANTAINE:        { label: 'Quarantaine',      tone: 'alert' },
  ACCEPTE:            { label: 'Accepté',          tone: 'olive' },
  EN_TRANSFORMATION:  { label: 'Transformation',   tone: 'info' },
  CONDITIONNE:        { label: 'Conditionné',      tone: 'olive' },
  STOCKE:             { label: 'En stock',         tone: 'olive' },
  EXPEDIE:            { label: 'Expédié',          tone: 'info' },
  RAPPELE:            { label: 'Rappelé',          tone: 'alert' },
  REJETE:             { label: 'Rejeté',           tone: 'alert' },
};

const TONE_VARS = {
  olive: { color: 'var(--olive-deep)', background: 'var(--olive-tint)' },
  alert: { color: 'var(--alert)', background: 'var(--alert-tint)' },
  warn:  { color: 'var(--warn)', background: 'var(--warn-tint)' },
  info:  { color: 'var(--info)', background: 'var(--info-tint)' },
};

export default function StatutBadge({ statut }) {
  const entry = CONFIG[statut] ?? { label: statut ?? 'Inconnu', tone: 'info' };
  return (
    <span className="badge" style={TONE_VARS[entry.tone]}>
      {entry.label}
    </span>
  );
}
