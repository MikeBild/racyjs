// Operate on inmemory data
const todos = [];

export default ({ config: { todosUrl } }) => {
  return {
    load,
    add,
    loadById,
    toogleDone,
    remove,
  };

  async function load() {
    return todos.filter(Boolean);
  }

  async function loadById(todoId) {
    return todos.find(({ id }) => id === todoId);
  }

  async function add(todo) {
    todo.id = (todos.length + 1).toString();

    todo.done = false;
    todos.push(todo);

    return todo;
  }

  async function toogleDone(todoId) {
    const todo = await loadById(todoId);

    todo.done = !todo.done;

    return todo;
  }

  async function remove(todoId) {
    const todo = await loadById(todoId);
    const todoIndex = todos.findIndex(({ id }) => id === todoId);

    delete todos[todoIndex];

    return todo;
  }
};
