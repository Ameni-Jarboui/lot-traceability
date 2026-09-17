const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../utils/auth');
const { logAudit } = require('../utils/audit');

const prisma = new PrismaClient();

// Ajouter un document/certificat à un lot
router.post('/:lotId', verifyToken, requireRole('QUALITE', 'ADMIN'), async(req, res) => {
    try {
        const { lotId } = req.params;
        const { nom, url, dateExpiration } = req.body;

        if (!nom || !url) {
            return res.status(400).json({ error: 'Nom et URL du document requis' });
        }

        const lot = await prisma.lot.findUnique({ where: { id: lotId } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable' });

        // Si un document du même nom existe déjà pour ce lot -> nouvelle version
        const existant = await prisma.document.findFirst({
            where: { lotId, nom },
            orderBy: { version: 'desc' },
        });
        const version = existant ? existant.version + 1 : 1;

        const document = await prisma.document.create({
            data: {
                lotId,
                nom,
                url,
                version,
                dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
            },
        });

        await logAudit(req.user.id, 'AJOUT_DOCUMENT', `Lot:${lotId}`, `Document:${nom} v${version}`);

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lister les documents d'un lot (avec statut expiré)
router.get('/:lotId', verifyToken, async(req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { lotId: req.params.lotId },
            orderBy: { createdAt: 'desc' },
        });

        const documentsAvecStatut = documents.map((doc) => ({
            ...doc,
            expire: doc.dateExpiration ? new Date(doc.dateExpiration) < new Date() : false,
        }));

        res.json(documentsAvecStatut);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer un document
router.delete('/:id', verifyToken, requireRole('QUALITE', 'ADMIN'), async(req, res) => {
    try {
        await prisma.document.delete({ where: { id: req.params.id } });
        await logAudit(req.user.id, 'SUPPRESSION_DOCUMENT', `Document:${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;