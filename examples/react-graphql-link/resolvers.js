export default {
  Mutation: {
    toggleVisibility(_, { visible }, { cache }) {
      const data = { visible, __typename: 'Visibility' };
      cache.writeData({ data });
      return data;
    },
  },
};
