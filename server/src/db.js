import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memory;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return;
  }

  console.log('No MONGODB_URI set — starting an in-memory MongoDB so the demo runs with zero setup...');
  memory = await MongoMemoryServer.create();
  await mongoose.connect(memory.getUri());
  console.log('In-memory MongoDB ready');
}
