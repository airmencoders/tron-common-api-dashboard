import React from 'react'
import { render, screen } from '@testing-library/react'

import Fieldset from '../Fieldset'

describe('Fieldset', () => {
  it('renders with children', () => {
    const pageRender = render(
      <Fieldset>
        Test Test
      </Fieldset>
    );

    const elem = pageRender.getByTestId('fieldset');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('Test Test')).toBeTruthy();
  });
})