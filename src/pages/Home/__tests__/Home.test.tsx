import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../Home';

describe('Test Home Page', () => {
  it('Renders', async () => {
    const page = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(page.getByTestId('home-page')).toBeDefined();
  });
})
