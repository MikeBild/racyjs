import React, { Fragment as F } from 'react';

export default ({ pages }) => (
  <F>
    <h1>Home Page</h1>
    <ul>
      <li>
        <a href="/about">About Page</a>
      </li>
      {pages &&
        pages.map(({ id }) => (
          <li key={id}>
            <a href={`/page/${id}`}>Page {id}</a>
          </li>
        ))}
    </ul>
  </F>
);
