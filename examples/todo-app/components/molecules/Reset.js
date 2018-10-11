import React, { Fragment as F } from 'react';
import { Query, Mutation } from 'react-apollo';

import ErrorMessageToast from './ErrorMessageToast';

import RESET_MUTATION from './ResetMutation.gql';
import ALL_ERROR_MESSAGES_QUERY from './ResetQuery.gql';

export default () => (
  <Query query={ALL_ERROR_MESSAGES_QUERY}>
    {({ data: { errorMessages } }) => (
      <F>
        {errorMessages && <ErrorMessageToast message={errorMessages} />}
        <Mutation mutation={RESET_MUTATION}>
          {(reset, { data, loading, error }) => {
            return <button onClick={() => reset()}>Reset</button>;
          }}
        </Mutation>
      </F>
    )}
  </Query>
);
