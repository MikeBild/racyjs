import React from 'react';
import { NavLink } from 'react-router-dom';

export default () => (
  <ul>
    <li>
      <NavLink to="/">Home</NavLink>
    </li>
    <li>
      <NavLink to="/todos">Todos</NavLink>
    </li>
    <li>
      <NavLink to="/about">About</NavLink>
    </li>
  </ul>
);
