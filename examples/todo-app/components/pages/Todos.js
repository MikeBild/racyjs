import React, { Fragment as F } from 'react';

import AddTodo from '../molecules/AddTodo';
import TodoList from '../organisms/TodoList';

export default () => (
  <F>
    <h1>Todos</h1>

    <AddTodo />

    <TodoList />
  </F>
);
