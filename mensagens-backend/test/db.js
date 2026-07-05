import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo;

export async function connectTestDb() {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
}

export async function clearTestDb() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function closeTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
}
