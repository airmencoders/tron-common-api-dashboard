import React from 'react'
import { render, screen } from '@testing-library/react'

import Label from '../Label'

describe('Label', () => {
  it('renders with children', () => {
    const pageRender = render(
      <Label htmlFor="test">
        Test Test
      </Label>
    );

    const elem = pageRender.getByTestId('label');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('Test Test')).toBeTruthy();
  });
})