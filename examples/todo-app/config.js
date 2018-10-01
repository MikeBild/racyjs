export default {
  port: process.env.PORT || 8080,
  todosUrl: process.env.TODOSURL || 'http://34.247.50.10/todos',
  graphqlUrl: process.env.GRAPHQLURL,
  shouldPrefetch: true,
};
