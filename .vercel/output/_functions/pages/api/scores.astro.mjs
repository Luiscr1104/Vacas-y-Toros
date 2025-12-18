import { MongoClient } from 'mongodb';
export { renderers } from '../../renderers.mjs';

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}
const uri = process.env.MONGODB_URI;
const options = {};
let client;
let clientPromise;
if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global;
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}
const clientPromise$1 = clientPromise;

const GET = async () => {
  try {
    const client = await clientPromise$1;
    const db = client.db("vacas-y-toros");
    const scores = await db.collection("scores").find({}).sort({ attempts: 1, time: 1 }).limit(10).toArray();
    return new Response(JSON.stringify(scores), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch scores" }), {
      status: 500
    });
  }
};
const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, attempts, time, mode } = data;
    if (!name || !attempts || !time) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400
      });
    }
    const client = await clientPromise$1;
    const db = client.db("vacas-y-toros");
    const result = await db.collection("scores").insertOne({
      name,
      attempts,
      time,
      mode,
      date: /* @__PURE__ */ new Date()
    });
    return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
      status: 201
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to save score" }), {
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
