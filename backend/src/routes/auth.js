const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/auth');

const prisma = new PrismaClient();

router.post('/register', async(req, res) => {
    try {
        const { email, password, nom, role } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, nom, role: 'OPERATEUR' },
        });

        const token = generateToken(user);
        res.status(201).json({ token, user: { id: user.id, email: user.email, nom: user.nom, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, email: user.email, nom: user.nom, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;