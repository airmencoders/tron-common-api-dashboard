import {render, waitFor, fireEvent} from '@testing-library/react';
import PersonEditForm from '../PersonEditForm';
import {PersonDto} from '../../../openapi/models';
import {FormActionType} from '../../../state/crud-page/form-action-type';

const testPerson: PersonDto = {
};

const testValidPerson: PersonDto = {
  firstName: 'First',
  lastName: 'Last',
  email: 'email@email.com'
}

it('should render', async () => {

  const form = render(
      <PersonEditForm
          data={testPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          successAction={{
            success: false,
            successMsg: ''
          }}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  await waitFor(
      () => expect(form.getByText('Email')).toBeTruthy()
  );
});

it('should not allow submit if email is not set', async () => {
  const form = render(
      <PersonEditForm
          data={testPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  await waitFor(
      () => expect(form.getByText('Add').closest('button'))
          .toHaveAttribute('disabled')
  );
});

it('should not allow submit if first name is not set', async () => {
  const form = render(
      <PersonEditForm
          data={testPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  await waitFor(
      () => expect(form.getByText('Add').closest('button'))
          .toHaveAttribute('disabled')
  );
});

it('should not allow submit if last name is not set', async () => {
  const form = render(
      <PersonEditForm
          data={testPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  await waitFor(
      () => expect(form.getByText('Add').closest('button'))
          .toHaveAttribute('disabled')
  );
});

it('should allow submit if form is modified', async () => {
  const form = render(
      <PersonEditForm
          data={testValidPerson}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );

  const firstNameInput = await form.getByLabelText('First Name', {selector: 'input'});
  fireEvent.change(firstNameInput, { target: { value: 'Tester'}});
  await waitFor(
      () => expect(form.getByText('Add').closest('button'))
          .not.toHaveAttribute('disabled')
  );
});
