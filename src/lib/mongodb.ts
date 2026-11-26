import { MongoClient } from 'mongodb';

const cache = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
};

/** Connect lazily; runtime environment variables also work outside Astro/Vite. */
export default async function getMongoClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI || import.meta.env?.MONGODB_URI;
    if (!uri) throw new Error('MongoDB no configurado');

    if (!cache._mongoClientPromise) {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        cache._mongoClientPromise = client.connect().catch(error => {
            cache._mongoClientPromise = undefined;
            void client.close().catch(() => {});
            throw error;
        });
    }
    return cache._mongoClientPromise;
}
