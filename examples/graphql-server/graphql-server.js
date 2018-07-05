import typeDefs from './schema.graphql';
import resolvers from './schema';
import todosConnector from './todos-connector';

export default ({ config }) => ({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, config, todos: todosConnector({ config }) }),
});
