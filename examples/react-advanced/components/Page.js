import React, { Fragment as F } from 'react';

export default ({ data }) => (
  <F>
    <h1>Page {data.id}</h1>
    <a href="/">Home Page</a>
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </F>
);
