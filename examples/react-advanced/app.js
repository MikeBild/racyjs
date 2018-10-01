import React from 'react';
import Home from './components/Home';
import About from './components/About';
import Page from './components/Page';

export default async ({ config }) => {
  const data = await import('./data.json');
  const routes = data.map(itm => ({
    path: `/page/${itm.id}`,
    exact: true,
    component: props => <Page data={itm} {...props} />,
  }));

  return [
    {
      path: '/',
      exact: true,
      component: props => <Home pages={data} {...props} />,
    },
    { path: '/about', exact: true, component: About },
    ...routes,
  ];
};
