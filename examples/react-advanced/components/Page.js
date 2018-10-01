import React, { Fragment as F } from 'react';
import { Link } from 'react-router-dom';

export default ({ data }) => (
  <F>
    <h1>Page!</h1>
    <Link to="/">Home Page Link</Link>
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </F>
);
