// Seuils configurables (tu peux les sortir dans un fichier config ou DB plus tard)
const SEUILS = {
    temperature: { min: 2, max: 25 },
    aciditee: { min: 0, max: 0.8 },
    humidite: { min: 0, max: 14 },
};

function evaluerControle({ temperature, aciditee, humidite, datePeremption }) {
    const raisons = [];

    if (temperature != null && (temperature < SEUILS.temperature.min || temperature > SEUILS.temperature.max)) {
        raisons.push(`Température hors seuil (${temperature}°C)`);
    }
    if (aciditee != null && aciditee > SEUILS.aciditee.max) {
        raisons.push(`Acidité trop élevée (${aciditee})`);
    }
    if (humidite != null && humidite > SEUILS.humidite.max) {
        raisons.push(`Humidité trop élevée (${humidite}%)`);
    }
    if (datePeremption && new Date(datePeremption) < new Date()) {
        raisons.push('Date de péremption dépassée');
    }

    return {
        conforme: raisons.length === 0,
        raisons,
    };
}

module.exports = { evaluerControle, SEUILS };