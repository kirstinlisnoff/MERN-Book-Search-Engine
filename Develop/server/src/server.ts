import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
// import routes from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config();

import { authMiddleware } from './services/auth.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';

const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => {
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

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  }); 
}

// app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
};

startApolloServer();
