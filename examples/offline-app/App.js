import React, { Fragment as F, Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const store = {
  state: {
    online: true,
  },
  update(online) {
    this.state = { online };
  },
};
const OnOfflineProvider = React.createContext(store);

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

const OfflinePage = ({ name, version }) => {
  return (
    <OnOfflineProvider.Consumer>
      {value => {
        return (
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
                    {({
                      data: { items = [] } = {},
                      loading,
                      error,
                      refetch,
                    }) => {
                      return (
                        <F>
                          {loading && <div>loading...</div>}
                          {error && <div>{error.message}</div>}
                          <ul>
                            {items &&
                              items.map(({ id, text }) => (
                                <li key={id}>{text}</li>
                              ))}
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
        );
      }}
    </OnOfflineProvider.Consumer>
  );
};

export default async ({ name, version, eventemitter }) => {
  eventemitter.on('online', () => {
    store.update(true);
  });
  eventemitter.on('offline', () => {
    store.update(false);
  });

  return (
    <OnOfflineProvider.Provider value={store}>
      <OfflinePage {...{ name, version }} />
    </OnOfflineProvider.Provider>
  );
};

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
