import React, { Fragment as F } from 'react';
import { Subscription } from 'react-apollo';

import GRAPHQL_SUBSCRIPTION from './ChangedSubscription.gql';

export default async ({ name, version }) => {
  return (
    <F>
      <h1>
        App: {name} {version}
      </h1>
      <Subscription subscription={GRAPHQL_SUBSCRIPTION}>
        {({ data, error, loading }) => {
          if (loading) return <div>loading ...</div>;
          if (error) return <div>{error.message}</div>;
          return <pre>{JSON.stringify(data, null, 4)}</pre>;
        }}
      </Subscription>
    </F>
  );
};
