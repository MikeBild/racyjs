import React, { Fragment as F } from 'react';
import { Query } from 'react-apollo';

import GITHUB_QUERY from './Github.gql';

export default async ({ name, version }) => {
  return (
    <F>
      <h1>
        App: {name} {version}
      </h1>
      <Query query={GITHUB_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <div>loading ...</div>;
          if (error) return <div>{error.message}</div>;
          return <pre>{JSON.stringify(data, null, 4)}</pre>;
        }}
      </Query>
    </F>
  );
};
