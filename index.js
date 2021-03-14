const { ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");
const mongoose = require("mongoose");

const { MONGODB } = require("./config");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

// ดูถึง 1.13 ชม

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

mongoose.connect(MONGODB, { useNewUrlParser: true });

server.listen({ port: 5000 }).then((res) => {
  console.log(`server running on port ${res.url}`);
});
