import React, { Fragment as F } from 'react';
import { renderRoutes } from 'react-router-config';
import Helmet from 'react-helmet';

import Navigation from '../molecules/Navigation';

export default ({ title, route }) => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
    </Helmet>
    <Navigation />
    {renderRoutes(route.routes)}
  </F>
);
