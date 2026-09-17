const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../utils/auth');

const prisma = new PrismaClient();

router.get('/', verifyToken, requireRole('ADMIN'), async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, nom: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/role', verifyToken, requireRole('ADMIN'), async(req, res) => {
    try {
        const { role } = req.body;
        if (!['OPERATEUR', 'QUALITE', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' });
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, email: true, nom: true, role: true },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;