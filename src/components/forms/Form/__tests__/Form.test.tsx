import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import Form from '../Form'

describe('Form', () => {
  it('renders', () => {
    const onSubmit = jest.fn();

    const pageRender = render(
      <Form onSubmit={onSubmit}>
        Test Test
      </Form>
    );

    const elem = pageRender.getByTestId('form');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('Test Test')).toBeTruthy();
  });

  it('submits', () => {
    const onSubmit = jest.fn();

    const pageRender = render(
      <Form onSubmit={onSubmit}>

      </Form>
    );

    const elem = pageRender.getByTestId('form');

    fireEvent.submit(elem);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
})