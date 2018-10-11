import React, { Fragment as F, createRef } from 'react';
import { Mutation } from 'react-apollo';

import ADD_TODO from './AddTodoMutation.gql';
import GET_TODOS from './TodosQuery.gql';

export default () => (
  <Mutation mutation={ADD_TODO} refetchQueries={[{ query: GET_TODOS }]}>
    {(
      addTodo,
      { data: { addTodo: { result = {}, failure } = {} } = {}, loading, error },
    ) => {
      const descriptionInput = createRef();

      return (
        <F>
          <input type="text" ref={descriptionInput} />
          <button
            onClick={() => {
              addTodo({
                variables: {
                  input: { description: descriptionInput.current.value },
                },
              });
              descriptionInput.current.value = '';
            }}
          >
            Add
          </button>
          {failure && <label>Failure: {failure.message}</label>}
        </F>
      );
    }}
  </Mutation>
);
