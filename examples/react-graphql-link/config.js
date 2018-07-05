import { withClientState } from 'apollo-link-state';
import resolvers from './resolvers';

export default {
  port: process.env.PORT || 8080,
  createLink: async ({ cache }) =>
    withClientState({
      cache,
      resolvers,
      defaults: {
        visible: false,
      },
    }),
};
