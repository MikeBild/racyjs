import React, { Fragment as F } from 'react';
import { Query, Mutation } from 'react-apollo';

import GET_VISIBLE from './Visible.gql';
import VISIBLE_TOGGLE from './VisibleToggle.gql';

export default async () => (
  <Query query={GET_VISIBLE}>
    {({ data: { visible } }) => {
      return (
        <F>
          <h1>GraphQL Example</h1>
          <h2>Visibility: {JSON.stringify(visible)}</h2>
          <Mutation mutation={VISIBLE_TOGGLE}>
            {toogleVisible => {
              return (
                <button
                  onClick={() =>
                    toogleVisible({ variables: { visible: !visible } })
                  }
                >
                  Toogle visibility
                </button>
              );
            }}
          </Mutation>
        </F>
      );
    }}
  </Query>
);
