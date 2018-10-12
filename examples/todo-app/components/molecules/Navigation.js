import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

const NavItem = styled.li`
  float: left;
  padding: 12px;
`;

export default () => (
  <NavList>
    <NavItem>
      <NavLink to="/">Home</NavLink>
    </NavItem>
    <NavItem>
      <NavLink to="/todos">Todos</NavLink>
    </NavItem>
    <NavItem>
      <NavLink to="/about">About</NavLink>
    </NavItem>
  </NavList>
);
