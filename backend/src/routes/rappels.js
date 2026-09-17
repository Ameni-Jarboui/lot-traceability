const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../utils/auth');
const { logAudit } = require('../utils/audit');

const prisma = new PrismaClient();

const CLIENTS_DEMO = [
    { nom: 'Supermarché Carrefour Tunis', email: 'contact@carrefour-demo.tn' },
    { nom: 'Grossiste Sfax Distribution', email: 'contact@sfaxdist-demo.tn' },
];

router.post('/:lotId', verifyToken, requireRole('QUALITE', 'ADMIN'), async(req, res) => {
    try {
        const { lotId } = req.params;
        const { motif } = req.body;

        const lot = await prisma.lot.findUnique({ where: { id: lotId } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable' });

        const rappelExistant = await prisma.rappel.findFirst({
            where: { lotId, statut: 'EN_COURS' },
        });
        if (rappelExistant) {
            return res.status(400).json({ error: 'Un rappel est déjà en cours pour ce lot' });
        }

        async function getDescendants(id) {
            const enfants = await prisma.lot.findMany({ where: { parentId: id } });
            let all = [...enfants];
            for (const e of enfants) all = all.concat(await getDescendants(e.id));
            return all;
        }
        const descendants = await getDescendants(lotId);
        const lotsAffectes = [lot, ...descendants];

        const rappel = await prisma.rappel.create({
            data: { lotId, motif: motif || 'Non spécifié' },
        });

        await prisma.lot.updateMany({
            where: { id: { in: lotsAffectes.map((l) => l.id) } },
            data: { statut: 'RAPPELE' },
        });

        await logAudit(req.user.id, 'RAPPEL_LANCE', `Lot:${lotId}`, `${lotsAffectes.length} lots affectés`);

        res.status(201).json({ rappel, lotsAffectes, clientsNotifies: CLIENTS_DEMO });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;