const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../utils/auth');
const { evaluerControle } = require('../utils/qualityRules');
const { logAudit } = require('../utils/audit');

const prisma = new PrismaClient();

// Créer un contrôle qualité pour un lot (par id)
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

        await prisma.lot.update({
            where: { id: lotId },
            data: { statut: evaluation.conforme ? 'VALIDE' : 'BLOQUE' },
        });

        if (!evaluation.conforme) {
            await prisma.mouvement.create({
                data: {
                    type: 'TRANSFORMATION',
                    details: `Lot bloqué : ${evaluation.raisons.join(', ')}`,
                    lotId,
                },
            });
        }

        await logAudit(req.user.id, 'CREATION_CONTROLE', `Lot:${lotId}`, JSON.stringify(evaluation));

        res.status(201).json({ controle, evaluation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Contrôle par code de lot (flux scan mobile) — authentifié aussi
router.post('/by-code/:lotCode', verifyToken, async(req, res) => {
    try {
        const { lotCode } = req.params;
        const lot = await prisma.lot.findUnique({ where: { code: lotCode } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable pour ce code' });

        const { temperature, aciditee, humidite, photoUrl, latitude, longitude } = req.body;

        const evaluation = evaluerControle({ temperature, aciditee, humidite, datePeremption: lot.datePeremption });

        const controle = await prisma.controle.create({
            data: {
                lotId: lot.id,
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

        const statutMap = { CONFORME: 'VALIDE', A_VERIFIER: 'QUARANTAINE', NON_CONFORME: 'BLOQUE' };
        await prisma.lot.update({
            where: { id: lotId },
            data: { statut: statutMap[evaluation.statut] },
        });

        res.status(201).json({ controle, evaluation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Valider officiellement un contrôle — Qualité et Admin uniquement
router.patch('/:id/valider', verifyToken, requireRole('QUALITE', 'ADMIN'), async(req, res) => {
    try {
        const controle = await prisma.controle.update({
            where: { id: req.params.id },
            data: { valide: true, valideParId: req.user.id },
        });
        await logAudit(req.user.id, 'VALIDATION_CONTROLE', `Controle:${req.params.id}`);
        res.json(controle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;