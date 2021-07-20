import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import TextInputWithDelete from '../TextInputWithDelete';


describe('TextInputWithDelete', () => {
  it('Renders', () => {
    const deleteHandler = jest.fn();

    const pageRender = render(
      <TextInputWithDelete
        id="text-input-with-delete"
        type="text"
        name="input-with-delete"
        onDeleteClickHandler={deleteHandler}
        value="TEST INPUT"
      />
    );

    expect(pageRender.getByTestId('textInput')).toBeInTheDocument();
  });

  it('Click handler called', () => {
    const deleteHandler = jest.fn();

    const pageRender = render(
      <TextInputWithDelete
        id="text-input-with-delete"
        type="text"
        name="input-with-delete"
        onDeleteClickHandler={deleteHandler}
        value="TEST INPUT"
        deleteButtonTitle="Remove Input"
      />
    );

    const deleteBtn = pageRender.getByTitle('Remove Input');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    expect(deleteHandler).toHaveBeenCalledTimes(1);
  });
})