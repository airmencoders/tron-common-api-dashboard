import {render, screen, waitFor} from '@testing-library/react';
import SubmitActions from '../SubmitActions';
import {FormActionType} from '../../../../state/crud-page/form-action-type';

it('should show add label', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.ADD}
          onCancel={() => jest.fn()}
          isFormValid={true}
          isFormModified={false}
          isFormSubmitting={false}
      />
  );

  await waitFor(
      () => expect(screen.getByText('Add')).toBeTruthy()
  );
});

it('should show update label', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.UPDATE}
          onCancel={() => jest.fn()}
          isFormValid={true}
          isFormModified={false}
          isFormSubmitting={false}
      />
  );

  await waitFor(
      () => expect(screen.getByText('Update')).toBeTruthy()
  );
});

it('should not allow submit if form is invalid', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.UPDATE}
          onCancel={() => jest.fn()}
          isFormValid={false}
          isFormModified={true}
          isFormSubmitting={false}
      />
  );

  await waitFor(
      () => expect(screen.getByText('Update').closest('button'))
          .toHaveAttribute('disabled')
  );
});

it('should not allow submit if form is not modified', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.UPDATE}
          onCancel={() => jest.fn()}
          isFormValid={true}
          isFormModified={false}
          isFormSubmitting={false}
      />
  );

  await waitFor(
      () => expect(screen.getByText('Update').closest('button'))
          .toHaveAttribute('disabled')
  );
});

it('should not show as submitting', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.UPDATE}
          onCancel={() => jest.fn()}
          isFormValid={true}
          isFormModified={true}
          isFormSubmitting={true}
      />
  );

  await waitFor(
      () => expect(screen.getByTitle('submitting')).toBeTruthy()
  );
});
