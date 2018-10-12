import React, { Fragment as F } from 'react';
import { renderRoutes } from 'react-router-config';
import Helmet from 'react-helmet';
import styled, { injectGlobal } from 'styled-components';

import Navigation from '../molecules/Navigation';

injectGlobal`
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const Content = styled.main`
  padding: 12px;
`;

export default ({ title, route }) => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
    </Helmet>

    <Navigation />
    <Content>{renderRoutes(route.routes)}</Content>
  </F>
);
