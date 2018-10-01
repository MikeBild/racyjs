import React from 'react';
import Home from './components/Home';
import About from './components/About';

export default async ({ config }) => [
  { path: '/', exact: true, component: Home },
  { path: '/about', exact: true, component: About },
];
