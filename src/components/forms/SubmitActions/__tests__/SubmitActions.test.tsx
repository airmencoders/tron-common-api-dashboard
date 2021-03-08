import {render, screen, waitFor} from '@testing-library/react';
import SubmitActions from '../SubmitActions';
import {FormActionType} from '../../../../state/crud-page/form-action-type';

it('should render', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.ADD}
          onCancel={() => {}}
          onSubmit={() => {}}
          isFormValid={true}
          isFormModified={false}
          isFormSubmitting={false}
      />
    );

      await waitFor(
          () => expect(screen.getByText('Add')).toBeTruthy()
      );
});

it('should show add label', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.ADD}
          onCancel={() => {}}
          onSubmit={() => {}}
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
          onCancel={() => {}}
          onSubmit={() => {}}
          isFormValid={true}
          isFormModified={false}
          isFormSubmitting={false}
      />
  );

  await waitFor(
      () => expect(screen.getByText('Update')).toBeTruthy()
  );
});

it('should show delete label', async () => {

    render(
        <SubmitActions
            formActionType={FormActionType.DELETE}
            onCancel={() => { }}
            onSubmit={() => { }}
            isFormValid={true}
            isFormModified={false}
            isFormSubmitting={false}
        />
    );

    await waitFor(
        () => expect(screen.getByText('Delete')).toBeTruthy()
    );
});

it('should not allow submit if form is invalid', async () => {

  render(
      <SubmitActions
          formActionType={FormActionType.UPDATE}
          onCancel={() => {}}
          onSubmit={() => {}}
          isFormValid={false}
          isFormModified={false}
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
          onCancel={() => {}}
          onSubmit={() => {}}
          isFormValid={false}
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
          onCancel={() => {}}
          onSubmit={() => {}}
          isFormValid={true}
          isFormModified={true}
          isFormSubmitting={true}
      />
  );

  await waitFor(
      () => expect(screen.getByTitle('submitting')).toBeTruthy()
  );
});
