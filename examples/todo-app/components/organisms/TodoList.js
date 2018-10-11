import React, { Fragment as F } from 'react';
import { Query, Mutation } from 'react-apollo';

import GET_TODOS from './TodosQuery.gql';

import REMOVE_TODO from './RemoveTodoMutation.gql';
import TOGGLE_DONE from './ToggleDoneMutation.gql';

import FILTER_TASKS from './FilterTasksMutation.gql';

export default () => (
  <Query query={GET_TODOS} notifyOnNetworkStatusChange={true}>
    {({
      data: { todos, visibility, errorMessages } = {},
      loading,
      error,
      refetch,
    }) => {
      return (
        <div>
          {error && <div>Error: {error.message}</div>}

          <Mutation mutation={FILTER_TASKS}>
            {(filterTasks, { data, loading, error }) => {
              return (
                <F>
                  <button
                    disabled={visibility === 'ALL'}
                    onClick={() =>
                      filterTasks({ variables: { visibility: 'ALL' } })
                    }
                  >
                    All Tasks
                  </button>
                  <button
                    disabled={visibility === 'DONE'}
                    onClick={() =>
                      filterTasks({ variables: { visibility: 'DONE' } })
                    }
                  >
                    Done Tasks
                  </button>
                  <button
                    disabled={visibility === 'OPEN'}
                    onClick={() =>
                      filterTasks({ variables: { visibility: 'OPEN' } })
                    }
                  >
                    Open Tasks
                  </button>
                </F>
              );
            }}
          </Mutation>

          <button onClick={() => refetch()}>Refresh</button>

          <ul>
            {loading && <span>loading...</span>}
            {!loading &&
              todos &&
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
                              <label>
                                <input
                                  type="checkbox"
                                  checked={done}
                                  onChange={() =>
                                    toggleDone({
                                      variables: { id },
                                    })
                                  }
                                />
                                {description}
                              </label>
                            </div>
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
);
