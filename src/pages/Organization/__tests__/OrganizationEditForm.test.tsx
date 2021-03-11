import {render, waitFor, fireEvent} from '@testing-library/react';
import OrganizationEditForm from '../OrganizationEditForm';
import {OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum} from '../../../openapi/models';
import {FormActionType} from '../../../state/crud-page/form-action-type';



const testOrganization: OrganizationDto = {
};

const testValidOrganization: OrganizationDto = {
  name: 'TestOrg',
  members: [],
  subordinateOrganizations: [],
  branchType: OrganizationDtoBranchTypeEnum.Usaf,
  orgType: OrganizationDtoOrgTypeEnum.Squadron,
};


it('should render', async () => {

  const form = render(
      <OrganizationEditForm
          data={testOrganization}
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
      () => expect(form.getByText('Organization Name')).toBeTruthy()
  );
});

it('should not allow submit if name is not set', async () => {
  const form = render(
      <OrganizationEditForm
          data={testOrganization}
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
      <OrganizationEditForm
          data={testValidOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );

  const orgNameInput = await form.getByLabelText('Organization Name', {selector: 'input'});
  fireEvent.change(orgNameInput, { target: { value: 'Tester'}});
  await waitFor(
      () => expect(form.getByText('Add').closest('button'))
          .not.toHaveAttribute('disabled')
  );
});

it('should set formState for name', async () => {
  const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  const orgNameInput = await form.getByLabelText('Organization Name', {selector: 'input'});
  fireEvent.change(orgNameInput, { target: { value: 'Tester'}});
  await waitFor(
      () => expect((orgNameInput as HTMLInputElement).value).toBe('Tester')
  );
});


it('should set formState for branchType', async () => {
  const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  const orgBranchType = await form.getByTestId('branchType');
  fireEvent.change(orgBranchType, { target: { value: 'USAF'}});
  await waitFor(
      () => expect((orgBranchType as HTMLInputElement).value).toBe('USAF')
  );
});

it('should set formState for orgType', async () => {
  const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.ADD}
      />
  );
  const orgType = await form.getByTestId('orgType');
  fireEvent.change(orgType, { target: { value: 'SQUADRON'}});
  await waitFor(
      () => expect((orgType as HTMLInputElement).value).toBe('SQUADRON')
  );
});


