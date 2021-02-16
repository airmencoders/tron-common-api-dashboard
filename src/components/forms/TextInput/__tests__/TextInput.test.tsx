import React from 'react'
import { render } from '@testing-library/react'

import TextInput from '../TextInput'

describe('TextInput', () => {
  it('renders', () => {
    const pageRender = render(
      <TextInput id="textinput-1" name="textinput-1" type="text" />
    );

    const elem = pageRender.getByTestId('textInput');

    expect(elem).toBeInTheDocument();
  });
})