import React, { Fragment as F } from 'react';
import { Link } from 'react-router-dom';

export default ({ pages }) => (
  <F>
    <h1>Home Page!</h1>
    <ul>
      <li>
        <Link to="/about">About Page Link</Link>
      </li>
      {pages &&
        pages.map(({ id }) => (
          <li key={id}>
            <Link to={`/page/${id}`}>Page {id} Link</Link>
          </li>
        ))}
    </ul>
  </F>
);
