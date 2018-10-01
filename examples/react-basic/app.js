import React, { Fragment as F } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';

const Headline = styled.h1`
  color: blue;
`;

export default async ({ config }) => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>React-App</title>
    </Helmet>
    <Headline>Racy Basic App Example</Headline>
  </F>
);
