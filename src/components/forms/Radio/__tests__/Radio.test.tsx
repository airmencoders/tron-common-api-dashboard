import React from 'react'
import { render, screen } from '@testing-library/react'

import Radio from '../Radio'

describe('Radio', () => {
  it('renders', () => {
    const pageRender = render(
      <Radio id="radio-1" name="radio-1" label="Test Label" />
    );

    const elem = pageRender.getByTestId('radio');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeTruthy();
  });
})