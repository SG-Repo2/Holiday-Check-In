import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header text', () => {
  render(<App />);
  const headerElement = screen.getByText(/Holiday Party Check-In/i);
  expect(headerElement).toBeInTheDocument();
});
