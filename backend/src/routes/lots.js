const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generateQrCode, generateLotCode } = require('../utils/qrGenerator');
const { verifyToken } = require('../utils/auth');

const prisma = new PrismaClient();

router.post('/', verifyToken, async(req, res) => {
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

router.get('/', async(req, res) => {
    try {
        const { produit, origine, campagne, statut } = req.query;

        const lots = await prisma.lot.findMany({
            where: {
                ...(produit && { produit: { contains: produit, mode: 'insensitive' } }),
                ...(origine && { origine: { contains: origine, mode: 'insensitive' } }),
                ...(campagne && { campagne: { contains: campagne, mode: 'insensitive' } }),
                ...(statut && { statut }),
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

        const documentsAvecStatut = lot.documents.map((doc) => ({
            ...doc,
            expire: doc.dateExpiration ? new Date(doc.dateExpiration) < new Date() : false,
        }));

        res.json({...lot, documents: documentsAvecStatut });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/fractionner', verifyToken, async(req, res) => {
    try {
        const { fractions } = req.body;
        const lotParent = await prisma.lot.findUnique({ where: { id: req.params.id } });

        if (!lotParent) return res.status(404).json({ error: 'Lot introuvable' });

        const totalFractions = fractions.reduce((sum, f) => sum + f.quantite, 0);
        if (totalFractions > lotParent.quantite) {
            return res.status(400).json({ error: 'La somme des fractions dépasse la quantité du lot parent' });
        }

        const enfants = [];
        for (const fraction of fractions) {
            const code = generateLotCode(lotParent.produit);
            const qrCodeUrl = await generateQrCode(code);
            const enfant = await prisma.lot.create({
                data: {
                    code,
                    produit: lotParent.produit,
                    origine: lotParent.origine,
                    campagne: lotParent.campagne,
                    quantite: fraction.quantite,
                    datePeremption: lotParent.datePeremption,
                    qrCodeUrl,
                    parentId: lotParent.id,
                },
            });
            await prisma.mouvement.create({
                data: {
                    type: 'FRACTIONNEMENT',
                    details: `Fractionné depuis ${lotParent.code}`,
                    lotId: enfant.id,
                },
            });
            enfants.push(enfant);
        }

        res.status(201).json(enfants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/descendants', async(req, res) => {
    try {
        async function getDescendants(lotId) {
            const enfants = await prisma.lot.findMany({ where: { parentId: lotId } });
            let all = [...enfants];
            for (const enfant of enfants) {
                const sousEnfants = await getDescendants(enfant.id);
                all = all.concat(sousEnfants);
            }
            return all;
        }
        const descendants = await getDescendants(req.params.id);
        res.json(descendants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/recombiner', verifyToken, async(req, res) => {
    try {
        const { lotIds } = req.body; // tableau d'IDs de lots à recombiner

        if (!lotIds || lotIds.length < 2) {
            return res.status(400).json({ error: 'Au moins 2 lots requis pour une recombinaison' });
        }

        const lots = await prisma.lot.findMany({ where: { id: { in: lotIds } } });

        if (lots.length !== lotIds.length) {
            return res.status(404).json({ error: 'Un ou plusieurs lots introuvables' });
        }

        // Vérifier que tous les lots sont du même produit et pas déjà bloqués/rappelés
        const produitRef = lots[0].produit;
        const incompatibles = lots.filter((l) => l.produit !== produitRef);
        if (incompatibles.length > 0) {
            return res.status(400).json({ error: 'Impossible de recombiner des lots de produits différents' });
        }

        const statutsInterdits = ['BLOQUE', 'RAPPELE'];
        const bloques = lots.filter((l) => statutsInterdits.includes(l.statut));
        if (bloques.length > 0) {
            return res.status(400).json({ error: 'Impossible de recombiner un lot bloqué ou rappelé' });
        }

        const quantiteTotale = lots.reduce((sum, l) => sum + l.quantite, 0);
        const code = generateLotCode(produitRef);
        const qrCodeUrl = await generateQrCode(code);

        // Le nouveau lot combiné prend le lot le plus ancien comme "parent" logique
        const lotCombine = await prisma.lot.create({
            data: {
                code,
                produit: produitRef,
                origine: lots.map((l) => l.origine).join(', '),
                campagne: lots[0].campagne,
                quantite: quantiteTotale,
                datePeremption: lots.reduce((min, l) =>
                    (l.datePeremption && (!min || l.datePeremption < min)) ? l.datePeremption : min, null),
                qrCodeUrl,
            },
        });

        // Lier les lots sources comme "enfants" du nouveau lot (traçabilité inverse)
        await prisma.lot.updateMany({
            where: { id: { in: lotIds } },
            data: { parentId: lotCombine.id },
        });

        await prisma.mouvement.create({
            data: {
                type: 'RECOMBINAISON',
                details: `Recombiné depuis les lots ${lots.map((l) => l.code).join(', ')}`,
                lotId: lotCombine.id,
            },
        });

        res.status(201).json(lotCombine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;