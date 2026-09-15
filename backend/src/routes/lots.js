const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generateQrCode, generateLotCode } = require('../utils/qrGenerator');

const prisma = new PrismaClient();

// Créer un lot (réception)
router.post('/', async(req, res) => {
    try {
        const { produit, origine, campagne, quantite, datePeremption } = req.body;

        if (quantite < 0) {
            return res.status(400).json({ error: 'Quantité négative interdite' });
        }

        const code = generateLotCode(produit);
        const qrCodeUrl = await generateQrCode(code);

        const lot = await prisma.lot.create({
            data: {
                code,
                produit,
                origine,
                campagne,
                quantite,
                datePeremption: datePeremption ? new Date(datePeremption) : null,
                qrCodeUrl,
            },
        });

        await prisma.mouvement.create({
            data: {
                type: 'RECEPTION',
                details: `Réception du lot ${code}`,
                lotId: lot.id,
            },
        });

        res.status(201).json(lot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Liste des lots avec filtres
router.get('/', async(req, res) => {
    try {
        const { produit, origine, campagne, statut } = req.query;
        const lots = await prisma.lot.findMany({
            where: {
                ...(produit && { produit }),
                ...(origine && { origine }),
                ...(campagne && { campagne }),
                ...(statut && { statut }),
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Détail d'un lot + timeline complète
router.get('/:id', async(req, res) => {
    try {
        const lot = await prisma.lot.findUnique({
            where: { id: req.params.id },
            include: {
                mouvements: { orderBy: { createdAt: 'asc' } },
                controles: { orderBy: { createdAt: 'asc' } },
                documents: true,
                enfants: true,
                parent: true,
            },
        });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable' });
        res.json(lot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;