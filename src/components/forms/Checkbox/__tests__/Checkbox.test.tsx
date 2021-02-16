import React from 'react'
import { render, screen } from '@testing-library/react'

import Checkbox from '../Checkbox'

describe('Checkbox', () => {
  it('renders', () => {
    const pageRender = render(
      <Checkbox id="checkbox-1" name="checkbox" label="Some Checkbox" />
    );

    const elem = pageRender.getByTestId('checkbox');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('Some Checkbox')).toBeTruthy();
  });
})