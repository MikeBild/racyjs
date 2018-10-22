export default {
  Query: {
    items() {
      return [{ id: 1, text: 'Demo 1' }, { id: 2, text: 'Demo 2' }];
    },
  },
  Mutation: {
    async addItem(_, { input }) {
      return null;
    },
  },
};
