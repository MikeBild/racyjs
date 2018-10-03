import React from 'react';
import Home from './components/Home';
import About from './components/About';
import Page from './components/Page';
import { matchRoutes } from 'react-router-config';

export default async ({ isServer, isProduction, request, port }) => {
  const data = await import('./data.json');
  const routes = data.map(itm => ({
    path: `/page/${itm.id}`,
    exact: true,
    component: props => <Page {...props} data={itm} />,
  }));

  return [
    {
      path: '/',
      exact: true,
      component: props => <Home {...props} pages={data} />,
    },
    { path: '/about', exact: true, component: About },
    ...routes,
  ];
};
