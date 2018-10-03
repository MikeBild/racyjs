import React from 'react';

export default async ({ isServer, isProduction, request, port }) => {
  // Automatic code splitting using dynamic imports
  const data = await import('./data.json');
  const { default: Home } = await import('./components/Home');
  const { default: About } = await import('./components/About');
  const { default: Page } = await import('./components/Page');
  const { default: NotFound } = await import('./components/NotFound');

  // Create dynamically routes based on external data
  const routes = data.map(itm => ({
    path: `/page/${itm.id}`,
    exact: true,
    // Pass external data down
    component: props => <Page {...props} data={itm} />,
  }));

  // Return a array of routes (react-router-config)
  return [
    {
      path: '/',
      exact: true,
      // Pass external data down
      component: props => <Home {...props} pages={data} />,
    },
    { path: '/about', exact: true, component: About },
    ...routes,
    { component: NotFound },
  ];
};
