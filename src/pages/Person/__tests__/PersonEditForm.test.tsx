import {render, waitFor, fireEvent} from '@testing-library/react';
import PersonEditForm from '../PersonEditForm';
import {PersonDto} from '../../../openapi/models';
import {FormActionType} from '../../../state/crud-page/form-action-type';



const testPerson: PersonDto = {
};

const testValidPerson: PersonDto = {
  firstName: 'First',
  lastName: 'Last',
  email: 'email@email.com',
  rank: 'CIV'
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

it('should set formState for lastName', async () => {
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
  const lastNameInput = await form.getByLabelText('Last Name', {selector: 'input'});
  fireEvent.change(lastNameInput, { target: { value: 'Tester'}});
  await waitFor(
      () => expect((lastNameInput as HTMLInputElement).value).toBe('Tester')
  );
});

it('should set formState for title', async () => {
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
  const titleInput = await form.getByLabelText('Title', {selector: 'input'});
  fireEvent.change(titleInput, { target: { value: 'Tester'}});
  await waitFor(
      () => expect((titleInput as HTMLInputElement).value).toBe('Tester')
  );
});

it('should set formState for dodid', async () => {
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
  const dodidInput = await form.getByLabelText('DoD Id', {selector: 'input'});
  fireEvent.change(dodidInput, { target: { value: '55555'}});
  await waitFor(
      () => expect((dodidInput as HTMLInputElement).value).toBe('55555')
  );
});

it('should set formState for phone', async () => {
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
  const phoneInput = await form.getByLabelText('Phone', {selector: 'input'});
  fireEvent.change(phoneInput, { target: { value: '5555555555'}});
  await waitFor(
      () => expect((phoneInput as HTMLInputElement).value).toBe('5555555555')
  );
});

it('should set formState for dutyPhone', async () => {
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
  const dutyPhoneInput = await form.getByLabelText('Duty Phone', {selector: 'input'});
  fireEvent.change(dutyPhoneInput, { target: { value: '5555555555'}});
  await waitFor(
      () => expect((dutyPhoneInput as HTMLInputElement).value).toBe('5555555555')
  );
});

it('should set formState for dutyTitle', async () => {
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
  const phoneInput = await form.getByLabelText('Duty Title', {selector: 'input'});
  fireEvent.change(phoneInput, { target: { value: 'Test'}});
  await waitFor(
      () => expect((phoneInput as HTMLInputElement).value).toBe('Test')
  );
});


