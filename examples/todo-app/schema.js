export default {
  Query: {
    async todos(_, __, { todos, config }) {
      return todos.load();
    },
  },
  Mutation: {
    async reset(_, __, { todos, config }) {
      throw new Error('Reset is not implemented');
    },
    async toogleDone(_, { id }, { todos, config }) {
      const result = await todos.toogleDone(id);
      return {
        result,
      };
    },
    async addTodo(_, { input }, { todos, config }) {
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
    async removeTodo(_, { id }, { todos, config }) {
      const result = await todos.remove(id);
      return {
        result,
        failure: null,
      };
    },
  },
};
