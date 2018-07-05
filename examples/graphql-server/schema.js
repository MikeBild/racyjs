export default {
  Query: {
    async todos(_, __, { todos, config, req }) {
      return await todos.load();
    },
    async todo(_, { id }, { todos, config, req }) {
      return await todos.loadById(id);
    },
  },
  Mutation: {
    async todoToogleDone(_, { id }, { todos, config, req }) {
      const result = await todos.toogleDone(id);
      return {
        result,
      };
    },
    async todoAdd(_, { input }, { todos, config, req }) {
      if (!input.description)
        return {
          result: null,
          failure: { message: 'Description should not be empty.' },
        };

      const result = await todos.add(input);

      return {
        result: { ...input, ...result, done: false },
        failure: null,
      };
    },
    async todoRemove(_, { id }, { todos, config, req }) {
      const result = await todos.remove(id);
      return {
        result,
        failure: null,
      };
    },
  },
};
