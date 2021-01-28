import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import Modal from '../Modal';

test('model is shown', async () => {
  render(<Modal
      headerComponent={(<div>Modal Title</div>)}
      footerComponent={(<div>Footer</div>)}
      show={true}
      onHide={() => {}}><div>Body</div></Modal>);
  await waitFor(
      () => expect(screen.getByText('Modal Title'))
          .toBeTruthy()
  )
});

test('model is hidden if not shown', async () => {
  render(<Modal
      headerComponent={(<div>Modal Title</div>)}
      footerComponent={(<div>Footer</div>)}
      show={false}
      onHide={() => {}}><div>Body</div></Modal>);
  await waitFor(
      () => expect(screen.queryByText('Modal Title'))
          .toBeFalsy()
  )
});

test('onClosed called by close icon', async () => {
  const handleCancel = jest.fn();
  render(<Modal
      headerComponent={(<div>Modal Title</div>)}
      footerComponent={(<div>Footer</div>)}
      show={true}
      onHide={handleCancel}><div>Body</div></Modal>);
  await waitFor(
      () => {
        const buttonEl = screen.getByTitle('close')
            .closest('button');
        if (buttonEl != null) {
          fireEvent.click(buttonEl);
          expect(handleCancel).toHaveBeenCalled();
        }
      }
  )
});
