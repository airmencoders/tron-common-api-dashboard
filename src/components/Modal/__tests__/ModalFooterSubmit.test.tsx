import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import ModalFooterSubmit from '../ModalFooterSubmit';
import ModalTitle from '../ModalTitle';

test('ModalFooterSubmit is shown', async () => {
  render(<ModalFooterSubmit  onCancel={() => {}} onSubmit={() => {}} />);
  await waitFor(
      () => {
        expect(screen.getByText('Submit')
            .closest('button'))
            .toBeTruthy();
        expect(screen.getByText('Cancel')
            .closest('button'))
            .toBeTruthy();
      }
  )
});

test('onSubmit is called if Submit clicked', async () => {
  const handleSubmit = jest.fn();
  render(<ModalFooterSubmit  onCancel={() => {}} onSubmit={handleSubmit} />);
  await waitFor(
      () => {
        const submitButton = screen.getByText('Submit')
            .closest('button');
        if (submitButton != null) {
          fireEvent.click(submitButton)
          expect(handleSubmit).toHaveBeenCalled();
        }
      }
  )
});

test('onSubmit is called if Cancel clicked', async () => {
  const handleCancel = jest.fn();
  render(<ModalFooterSubmit  onCancel={handleCancel} onSubmit={() => {}} />);
  await waitFor(
      () => {
        const cancelButton = screen.getByText('Cancel')
            .closest('button');
        if (cancelButton != null) {
          fireEvent.click(cancelButton)
          expect(handleCancel).toHaveBeenCalled();
        }
      }
  );
});

