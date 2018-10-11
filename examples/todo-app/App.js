import React from 'react';

import Layout from './components/templates/Layout';
import Home from './components/pages/Home';
import Todos from './components/pages/Todos';
import About from './components/pages/About';
import NotFound from './components/pages/NotFound';

export default async ({ isServer, request, name, version }) => {
  return [
    {
      component: Layout,
      routes: [
        {
          path: '/',
          exact: true,
          component: props => <Home {...props} name={name} version={version} />,
        },
        { path: '/todos', exact: true, component: Todos },
        { path: '/about', exact: true, component: About },
        { component: NotFound },
      ],
    },
  ];
};
