import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'liner-notes';

const client = new MongoClient(uri);

let db: Db;

export const connectMongo = async () => {
    await client.connect();
    db = client.db(dbName);

    await db.collection('tracks').createIndex({ trackId: 1 }, { unique: true });
    await db.collection('histories').createIndex({ userId: 1 }, { unique: true });

    console.log('MongoDB Client Connected');
};

export const getDb = (): Db => {
    if (!db) throw new Error('MongoDB not connected');
    return db;
};

export const closeMongo = async () => {
    await client.close();
};
