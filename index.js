const { createServer } = require ('http');
const { execute, subscribe } = require ('graphql');
const { SubscriptionServer } = require ('subscriptions-transport-ws');
const { makeExecutableSchema } = require ('@graphql-tools/schema');
const express = require('express');
const { ApolloServer, AuthenticationError} = require("apollo-server-express");
const { typeDefs } = require('./schemas/index.js');
const { authResolver } = require('./resolvers/auth');
const { bookingResolver } = require('./resolvers/booking');
const { eventResolver } = require('./resolvers/event');
const _ = require('lodash');
const mongoose = require('mongoose');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'f1BtnWgD3VKY';

async function startApolloServer(typeDefs, authResolver, bookingResolver, eventResolver) {
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers:  _.merge({}, authResolver, bookingResolver, eventResolver),
  });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth) {
        const decodedToken = jwt.verify(
          auth.split(' ')[1], JWT_SECRET
        );
        const user = await User.findById(decodedToken.id);
        // if (!user) throw new AuthenticationError('you must be logged in');
        return { user };
      }
    }
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { 
      schema, 
      execute, 
      subscribe 
    },
    { 
      server: httpServer, 
      path: server.graphqlPath 
    }
  );
  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  
  mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cnfkb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    err => {
      if (err) throw err;
      console.log('Connected successfully');
    });
  mongoose.set('useFindAndModify', false);
  return { server, app };
}
startApolloServer(typeDefs, authResolver, bookingResolver, eventResolver)



