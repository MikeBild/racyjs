import typeDefs from './schema.graphql';
import resolvers from './schema';

export default ({ config }) => ({
  typeDefs,
  resolvers,
  context: { config },
});
