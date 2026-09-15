const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function logAudit(userId, action, cible, details = '') {
    await prisma.auditLog.create({
        data: { userId, action, cible, details },
    });
}

module.exports = { logAudit };