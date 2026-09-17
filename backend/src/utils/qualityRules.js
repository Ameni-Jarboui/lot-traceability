const SEUILS = {
    temperature: { min: 2, max: 25 },
    aciditee: { min: 0, max: 0.8 },
    humidite: { min: 0, max: 14 },
};

function evaluerControle({ temperature, aciditee, humidite, datePeremption }) {
    const raisons = [];
    const raisonsCritiques = [];

    if (temperature != null && (temperature < SEUILS.temperature.min || temperature > SEUILS.temperature.max)) {
        raisonsCritiques.push(`Température hors seuil (${temperature}°C)`);
    }
    if (aciditee != null && aciditee > SEUILS.aciditee.max) {
        raisons.push(`Acidité légèrement élevée (${aciditee})`);
    }
    if (humidite != null && humidite > SEUILS.humidite.max) {
        raisons.push(`Humidité légèrement élevée (${humidite}%)`);
    }
    if (datePeremption && new Date(datePeremption) < new Date()) {
        raisonsCritiques.push('Date de péremption dépassée');
    }

    let statut = 'CONFORME';
    if (raisonsCritiques.length > 0) statut = 'NON_CONFORME';
    else if (raisons.length > 0) statut = 'A_VERIFIER';

    return {
        conforme: statut === 'CONFORME',
        statut, // CONFORME | A_VERIFIER | NON_CONFORME
        raisons: [...raisonsCritiques, ...raisons],
    };
}

module.exports = { evaluerControle, SEUILS };