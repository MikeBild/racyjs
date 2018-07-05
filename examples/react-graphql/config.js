export default {
  port: process.env.PORT || 8080,
  graphqlUrl: process.env.GRAPHQLURL || 'https://www.graphqlhub.com/graphql',
  createFragmentTypes: async () => await import('./fragmentTypes.json'),
  shouldPrefetch: true,
};
