import React, { Fragment as F, createRef } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { Query, Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';

import GET_TODOS from './Todos.gql';
import ADD_TODO from './AddTodo.gql';
import REMOVE_TODO from './RemoveTodo.gql';
import TOGGLE_DONE from './ToggleDone.gql';
import FILTER_TASKS from './FilterTasks.gql';

import RESET from './Reset.gql';

const HeadLine = styled.h1`
  color: blue;
`;

export default () => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Todo-App</title>
    </Helmet>
    <ul>
      <li>
        <Link to="/about">About</Link>
      </li>
    </ul>

    <Mutation mutation={RESET}>
      {(reset, { data, loading, error }) => {
        return <button onClick={() => reset()}>Reset</button>;
      }}
    </Mutation>

    <Mutation mutation={ADD_TODO} refetchQueries={[{ query: GET_TODOS }]}>
      {(
        addTodo,
        {
          data: { addTodo: { result = {}, failure } = {} } = {},
          loading,
          error,
        },
      ) => {
        let descriptionInput;

        return (
          <F>
            <input type="text" ref={node => (descriptionInput = node)} />
            <button
              onClick={() => {
                addTodo({
                  variables: { input: { description: descriptionInput.value } },
                });
                descriptionInput.value = '';
              }}
            >
              Add
            </button>
            {failure && <label>Failure: {failure.message}</label>}
          </F>
        );
      }}
    </Mutation>

    <Query query={GET_TODOS} notifyOnNetworkStatusChange={true}>
      {({
        data: { todos, visibility, errorMessages } = {},
        loading,
        error,
        refetch,
      }) => {
        return (
          <div>
            <HeadLine>Todos {loading && <span>loading...</span>}</HeadLine>
            {error && <div>Error: {error.message}</div>}
            {errorMessages && <div>Error Messages: {errorMessages}</div>}
            <Mutation mutation={FILTER_TASKS}>
              {(filterTasks, { data, loading, error }) => {
                return (
                  <F>
                    <button
                      onClick={() =>
                        filterTasks({ variables: { visibility: 'ALL' } })
                      }
                    >
                      All Tasks {visibility === 'ALL' ? '*' : ''}
                    </button>
                    <button
                      onClick={() =>
                        filterTasks({ variables: { visibility: 'DONE' } })
                      }
                    >
                      Done Tasks {visibility === 'DONE' ? '*' : ''}
                    </button>
                    <button
                      onClick={() =>
                        filterTasks({ variables: { visibility: 'OPEN' } })
                      }
                    >
                      Open Tasks {visibility === 'OPEN' ? '*' : ''}
                    </button>
                  </F>
                );
              }}
            </Mutation>
            <button onClick={() => refetch()}>reload</button>
            <ul>
              {todos &&
                todos
                  .filter(({ done }) => {
                    switch (visibility) {
                      case 'ALL':
                        return true;
                        break;
                      case 'DONE':
                        return done === true;
                        break;
                      case 'OPEN':
                        return done === false;
                        break;
                    }
                  })
                  .map(({ id, done, description }) => (
                    <li key={id}>
                      <Mutation mutation={TOGGLE_DONE}>
                        {(toggleDone, { data, loading, error }) => {
                          return (
                            <div>
                              <div>
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={done}
                                />{' '}
                                {description}
                              </div>
                              <button
                                onClick={() =>
                                  toggleDone({
                                    variables: { id },
                                  })
                                }
                              >
                                Toogle
                              </button>
                              <Mutation
                                mutation={REMOVE_TODO}
                                refetchQueries={[{ query: GET_TODOS }]}
                              >
                                {(removeTodo, { data, loading, error }) => {
                                  return (
                                    <button
                                      onClick={() =>
                                        removeTodo({ variables: { id } })
                                      }
                                    >
                                      Remove
                                    </button>
                                  );
                                }}
                              </Mutation>
                            </div>
                          );
                        }}
                      </Mutation>
                    </li>
                  ))}
            </ul>
          </div>
        );
      }}
    </Query>
  </F>
);
