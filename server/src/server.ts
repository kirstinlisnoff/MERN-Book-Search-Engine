import express from 'express';
import path from 'node:path';
import mongoose from 'mongoose';  // Instead of importing your `db` connection
import dotenv from 'dotenv';
dotenv.config();

import { authMiddleware } from './services/auth.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting server...');
const startApolloServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');
    console.log('MongoDB connected successfully');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => authMiddleware(req),
      }),
    );

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
      });
    }
app.get('/', (_req, res) => {
  res.send('Express server is running');
});

    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startApolloServer();
