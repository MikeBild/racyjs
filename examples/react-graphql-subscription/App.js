import React, { Fragment as F } from 'react';
import gql from 'graphql-tag';
import { Subscription } from 'react-apollo';

const GRAPHQL_SUBSCRIPTION = gql`
  subscription OnChanged {
    changed {
      id
      name
    }
  }
`;

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
