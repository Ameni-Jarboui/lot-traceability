const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../utils/auth');
const { evaluerControle } = require('../utils/qualityRules');
const { logAudit } = require('../utils/audit');

const prisma = new PrismaClient();

// Créer un contrôle qualité pour un lot
router.post('/:lotId', verifyToken, async(req, res) => {
    try {
        const { lotId } = req.params;
        const { temperature, aciditee, humidite, photoUrl, latitude, longitude } = req.body;

        const lot = await prisma.lot.findUnique({ where: { id: lotId } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable' });

        const evaluation = evaluerControle({
            temperature,
            aciditee,
            humidite,
            datePeremption: lot.datePeremption,
        });

        const controle = await prisma.controle.create({
            data: {
                lotId,
                temperature,
                aciditee,
                humidite,
                photoUrl,
                latitude,
                longitude,
                resultat: evaluation.conforme ? 'CONFORME' : 'NON_CONFORME',
                operateurId: req.user.id,
            },
        });

        // Si non conforme -> bloquer le lot + créer mouvement + audit
        if (!evaluation.conforme) {
            await prisma.lot.update({
                where: { id: lotId },
                data: { statut: 'BLOQUE' },
            });

            await prisma.mouvement.create({
                data: {
                    type: 'TRANSFORMATION',
                    details: `Lot bloqué : ${evaluation.raisons.join(', ')}`,
                    lotId,
                },
            });

            // Ici tu appelleras ton webhook n8n pour l'email (Étape 5)
            // await fetch(process.env.N8N_WEBHOOK_ALERTE, { method: 'POST', body: JSON.stringify({ lot, raisons: evaluation.raisons }) });
        } else {
            await prisma.lot.update({ where: { id: lotId }, data: { statut: 'VALIDE' } });
        }

        await logAudit(req.user.id, 'CREATION_CONTROLE', `Lot:${lotId}`, JSON.stringify(evaluation));

        res.status(201).json({ controle, evaluation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;