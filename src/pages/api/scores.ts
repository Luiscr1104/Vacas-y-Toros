import type { APIRoute } from 'astro';
import clientPromise from '../../lib/mongodb';

export const GET: APIRoute = async () => {
    try {
        const client = await clientPromise;
        const db = client.db('vacas-y-toros');
        const scores = await db
            .collection('scores')
            .find({})
            .sort({ attempts: 1, time: 1 })
            .limit(10)
            .toArray();

        return new Response(JSON.stringify(scores), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || 'Failed to fetch scores' }), {
            status: 500
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { name, attempts, time, mode } = data;

        if (name === undefined || attempts === undefined || time === undefined) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), {
                status: 400
            });
        }

        const client = await clientPromise;
        const db = client.db('vacas-y-toros');
        const result = await db.collection('scores').insertOne({
            name,
            attempts,
            time,
            mode,
            date: new Date()
        });

        return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
            status: 201
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || 'Failed to save score' }), {
            status: 500
        });
    }
};
