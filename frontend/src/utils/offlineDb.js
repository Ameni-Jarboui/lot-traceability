import { openDB } from 'idb';

const DB_NAME = 'zen-offline-db';
const STORE_NAME = 'pending-controles';

async function getDb() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
            }
        },
    });
}

export async function savePendingControle(controle) {
    const db = await getDb();
    await db.add(STORE_NAME, {...controle, createdOfflineAt: new Date().toISOString() });
}

export async function getPendingControles() {
    const db = await getDb();
    return db.getAll(STORE_NAME);
}

export async function deletePendingControle(localId) {
    const db = await getDb();
    await db.delete(STORE_NAME, localId);
}

export async function countPending() {
    const db = await getDb();
    return db.count(STORE_NAME);
}