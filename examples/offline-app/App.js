import React, { Fragment as F, Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
class Demo extends Component {
  constructor(props) {
    super(props);

    this.state = { done: false };
  }

  render() {
    const Components = () => React.Children.only(this.props.children);
    return (
      <F>
        <h1>{JSON.stringify(this.state.done)}</h1>
        <button onClick={() => this.setState({ done: !this.state.done })}>
          Toggle
        </button>
        <Components done={this.state.done} />
      </F>
    );
  }
}

const NETWORK_STATE = gql`
  query NetworkState {
    network @client {
      status
    }
  }
`;

const GET_ITEMS = gql`
  query AllItems {
    items {
      id
      text
    }
  }
`;

export default async ({ name, version }) => {
  return (
    <Demo>
      <Query query={NETWORK_STATE}>
        {({
          data: {
            network: { status },
          },
          error,
          loading,
        }) => {
          return (
            <F>
              <h1>Offline App {version}</h1>
              <pre>Network: {JSON.stringify(status)}</pre>
              <Query query={GET_ITEMS}>
                {({ data: { items = [] } = {}, loading, error, refetch }) => {
                  return (
                    <F>
                      {loading && <div>loading...</div>}
                      {error && <div>{error.message}</div>}
                      <ul>
                        {items &&
                          items.map(({ id, text }) => <li key={id}>{text}</li>)}
                        <li />
                      </ul>
                      <button onClick={() => refetch()}>Refetch</button>
                    </F>
                  );
                }}
              </Query>
            </F>
          );
        }}
      </Query>
    </Demo>
  );
};
