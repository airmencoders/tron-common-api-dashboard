import React from 'react';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { OrganizationControllerApi, OrganizationControllerApiInterface, PersonControllerApi, PersonControllerApiInterface, RankControllerApi } from '../../../openapi';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../openapi/models';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import OrganizationService from '../../../state/organization/organization-service';
import { OrganizationDtoWithDetails, OrgWithDetails, PersonWithDetails, useOrganizationState } from '../../../state/organization/organization-state';
import OrganizationEditForm from '../OrganizationEditForm';

jest.mock('../../../state/person/person-state');
jest.mock('../../../state/organization/organization-state');

// represents an organization returned from a GET to
//   .../organization/:id?people="id,firstName,lastName",organizations="id,name"
let originalLeader = { id: 'some id', firstName: 'Frank', lastName: 'Summers' };
const existingOrg: OrganizationDto = {
  id: '13c23dd4-e0d5-4d05-8237-8b88f582b114',
  name: 'existing',
  members: ['an id'],
  parentOrganization: 'parent org',
  subordinateOrganizations: new Set(['sub org']),
  leader: originalLeader.id,
  branchType: OrganizationDtoBranchTypeEnum.Usaf,
  orgType: OrganizationDtoOrgTypeEnum.Squadron
};

let mockUseOrganizationState : any = undefined;

let organizationApi: OrganizationControllerApiInterface;
let personApi: PersonControllerApiInterface;
let organizationState: State<OrganizationDto[]> & StateMethodsDestroy;
let organizationChooserState: State<OrganizationDto[]> & StateMethodsDestroy;
let personChooserState: State<PersonDto[]> & StateMethodsDestroy;

let onPatch = jest.fn();
let onClose = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  jest.useFakeTimers();
  onPatch = jest.fn().mockImplementation(() => {

  });

  onClose = jest.fn().mockImplementation(() => {

  });

  organizationApi = new OrganizationControllerApi();
  personApi = new PersonControllerApi();
  organizationState = createState<OrganizationDto[]>([

  ]);
  organizationChooserState = createState<OrganizationDto[]>([]);
  personChooserState = createState<PersonDto[]>([]);

  mockUseOrganizationState = new OrganizationService(organizationState, organizationApi, organizationChooserState, personChooserState, personApi);

  (useOrganizationState as jest.Mock).mockReturnValue(mockUseOrganizationState);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();

  organizationState.destroy();
  organizationChooserState.destroy();
  personChooserState.destroy();

  existingOrg.leader = originalLeader.id;
});

const testOrganization: OrganizationDtoWithDetails = {};

const membersSet = new Set<string>();
membersSet.add('some id');

const subOrgsSet = new Set<string>();
subOrgsSet.add('some id');

const testValidOrganization: OrganizationDtoWithDetails = {
  id: 'some id',
  name: 'TestOrg',
  leader: {
    id: "some leader id",
    firstName: "firstName",
    lastName: "lastName"
  },
  parentOrganization: undefined,
  members: undefined,
  subordinateOrganizations: undefined,
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

it('should allow to choose parent', async () => {
  const form = render(
    <OrganizationEditForm
      data={testValidOrganization}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  jest.spyOn(organizationApi, 'filterOrganizations').mockImplementation(() => {
    return Promise.resolve({
      data: {
        data: [
          existingOrg
        ],
        pagination: {

        }
      },
      status: 200,
      headers: {},
      config: {},
      statusText: 'OK'
    });
  });

  const parentBtn = form.getByTestId('change-org-parent__btn');
  fireEvent.click(parentBtn);

  await waitFor(
    () => {
      expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
    }
  );

  // Find checkbox
  const orgRow = await form.findByText(new RegExp(existingOrg.name!, 'i'));
  expect(orgRow.parentElement).toBeInTheDocument();
  const orgRowCheckbox = orgRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(orgRowCheckbox).toBeInTheDocument();

  // Check it
  fireEvent.click(orgRowCheckbox!);
  expect(orgRowCheckbox).toBeChecked();

  // ack the dialog selection to set the parent
  const okBtn = form.getByTestId('chooser-ok__btn');
  await waitFor(
    () => {
      expect(okBtn).not.toBeDisabled();
    }
  );
  expect(okBtn).not.toBeDisabled();
  fireEvent.click(okBtn);

  expect(form.getByDisplayValue(existingOrg.name!)).toBeInTheDocument();

  const updateBtn = form.getByText('Update');
  expect(updateBtn).toBeInTheDocument();
  await waitFor(
    () => {
      expect(updateBtn).not.toBeDisabled();
    }
  );
  fireEvent.click(updateBtn);
  expect(onPatch).toHaveBeenCalledTimes(1);
});


it('should allow to remove parent', async () => {  
  const orgWithParent: OrganizationDtoWithDetails = {
    ...testValidOrganization,
    parentOrganization: {
      id: 'parent org id',
      name: 'parent org name'
    }
  };

  const form = render(
    <OrganizationEditForm
      data={orgWithParent}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form.getByDisplayValue(`${orgWithParent.parentOrganization!.name}`)).toBeInTheDocument()
  )

  const parentBtn = form.getByTestId('remove-org-parent__btn');
  fireEvent.click(parentBtn);

  await waitFor(
    () => expect(form.getByTestId('remove-confirm-ok__btn')).toBeVisible()
  );

  const okBtn = form.getByTestId('remove-confirm-ok__btn');
  fireEvent.click(okBtn);

  await expect(form.findByDisplayValue(orgWithParent.parentOrganization!.name!)).rejects.toThrow();
});

it('should allow to choose leader', async () => {
  const testPerson: PersonDto = {
    id: 'test person id',
    email: 'test person email',
    firstName: 'first name',
    lastName: 'last name'
  };

  jest.spyOn(personApi, 'getPersonsWrapped').mockImplementation(() => {
    return Promise.resolve({
      data: {
        data: [
          testPerson
        ],
        pagination: {

        }
      },
      status: 200,
      headers: {},
      config: {},
      statusText: 'OK'
    });
  });

  const form = render(
    <OrganizationEditForm
      data={testValidOrganization}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
      .getByDisplayValue(`${testValidOrganization.leader?.firstName} ${testValidOrganization.leader?.lastName}`))
        .toBeInTheDocument()
  );

  const leaderBtn = form.getByTestId('change-org-leader__btn');
  fireEvent.click(leaderBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );

  // close dialog
  const closeCloseBtn = form.getByTestId('chooser-cancel__btn');
  fireEvent.click(closeCloseBtn); 

  fireEvent.click(leaderBtn);

  // re-open dialog
  await waitFor(
  () => {
      expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
  });

  // find checkbox
  const personRow = await form.findByText(testPerson.firstName!);
  expect(personRow.parentElement).toBeInTheDocument();
  const personRowCheckbox = personRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(personRowCheckbox).toBeInTheDocument();

  // Check it
  fireEvent.click(personRowCheckbox!);
  expect(personRowCheckbox).toBeChecked();

  const okBtn = form.getByTestId('chooser-ok__btn');

  await waitFor(
    () => expect(okBtn).not.toBeDisabled()
  );

  // ack the dialog selection to set the leader
  fireEvent.click(okBtn);

  expect(form.getByDisplayValue(`${testPerson.firstName} ${testPerson.lastName}`)).toBeInTheDocument();
});


it('should allow to remove leader', async () => {
  const form = render(
    <OrganizationEditForm
      data={testValidOrganization}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => expect(form
        .getByDisplayValue(`${testValidOrganization.leader!.firstName} ${testValidOrganization.leader!.lastName}`))
          .toBeInTheDocument()
  )

  const leaderBtn = form.getByTestId('remove-org-leader__btn');
  fireEvent.click(leaderBtn);

  await waitFor(
    () => expect(form.getByTestId('remove-confirm-ok__btn')).toBeVisible()
  );

  // cancel removal confirmation
  const cancelBtn = form.getByTestId('remove-cancel__btn');
  fireEvent.click(cancelBtn);

  fireEvent.click(leaderBtn);
  await waitFor(
    () => expect(form.getByTestId('remove-confirm-ok__btn')).toBeVisible()
  );
  fireEvent.click(form.getByTestId('remove-confirm-ok__btn'));

  await expect(form.findByDisplayValue(testValidOrganization.leader!.firstName!)).rejects.toThrow();
});

it('should allow to add new member', async () => {
  const testPerson: PersonDto = {
    id: 'test person id',
    email: 'test person email',
    firstName: 'first name',
    lastName: 'last name'
  };

  jest.spyOn(personApi, 'getPersonsWrapped').mockImplementation(() => {
    return Promise.resolve({
      data: {
        data: [
          testPerson
        ],
        pagination: {

        }
      },
      status: 200,
      headers: {},
      config: {},
      statusText: 'OK'
    });
  });

  const form = render(
    <OrganizationEditForm
      data={testValidOrganization}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => expect(form
        .getByDisplayValue(`${testValidOrganization.leader!.firstName} ${testValidOrganization.leader!.lastName}`))
          .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Organization Members (0)')).toBeVisible()
  )
  
  const memberBtn = form.getByTestId('org-add-member__btn');
  fireEvent.click(memberBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();          
      }
  );

  const personRow = await form.findByText(testPerson.firstName!);
  expect(personRow.parentElement).toBeInTheDocument();
  const personRowCheckbox = personRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(personRowCheckbox).toBeInTheDocument();
  fireEvent.click(personRowCheckbox!);
  expect(personRowCheckbox).toBeChecked();

  const okBtn = form.getByTestId('chooser-ok__btn');
  await waitFor(
    () => expect(okBtn).not.toBeDisabled()
  );
  fireEvent.click(okBtn);

  await expect(form.findByText(testPerson.firstName!)).resolves.toBeInTheDocument();
});

it('should allow to remove a member', async () => {
  const testPerson: PersonWithDetails = {
    id: 'test person id',
    firstName: 'first name',
    lastName: 'last name'
  };

  const validOrg: OrganizationDtoWithDetails = {
    ...testValidOrganization,
    members: [
      testPerson
    ]
  };

  const form = render(
    <OrganizationEditForm
      data={validOrg}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
      .getByDisplayValue(`${validOrg.leader!.firstName} ${validOrg.leader!.lastName}`))
      .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Organization Members (1)')).toBeVisible()
  )

  await expect(form.findByText(testPerson.lastName!)).resolves.toBeInTheDocument();

  const personRow = await form.findByText(testPerson.lastName!);
  expect(personRow.parentElement).toBeInTheDocument();
  const personRowCheckbox = personRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(personRowCheckbox).toBeInTheDocument();

  fireEvent.click(personRowCheckbox!);
  expect(personRowCheckbox).toBeChecked();

  const memberBtn = form.getByTestId('org-member-remove-selected__btn');
  await waitFor(
    () => expect(memberBtn).not.toBeDisabled()
  )
  fireEvent.click(memberBtn);

  await waitFor(
    () => expect(form.getByText('Organization Members (0)')).toBeVisible()
  )
});

it('should allow to add new sub org', async () => {
  jest.spyOn(organizationApi, 'filterOrganizations').mockImplementation(() => {
    return Promise.resolve({
      data: {
        data: [
          existingOrg
        ],
        pagination: {

        }
      },
      status: 200,
      headers: {},
      config: {},
      statusText: 'OK'
    });
  });

  const form = render(
    <OrganizationEditForm
      data={testValidOrganization}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => expect(form
        .getByDisplayValue(`${testValidOrganization.leader!.firstName} ${testValidOrganization.leader!.lastName}`))
          .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Subordinate Organizations (0)')).toBeVisible()
  )

  const subBtn = form.getByTestId('org-add-suborg__btn');
  fireEvent.click(subBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );

  const orgRow = await form.findByText(existingOrg.id!);
  expect(orgRow.parentElement).toBeInTheDocument();
  const orgRowCheckbox = orgRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(orgRowCheckbox).toBeInTheDocument();
  fireEvent.click(orgRowCheckbox!);
  expect(orgRowCheckbox).toBeChecked();

  const okBtn = form.getByTestId('chooser-ok__btn');
  await waitFor(
    () => expect(okBtn).not.toBeDisabled()
  );
  fireEvent.click(okBtn);

  await expect(form.findByText(existingOrg.name!)).resolves.toBeInTheDocument();
});

it('should allow to remove a sub org', async () => {
  const subOrg: OrgWithDetails = {
    id: 'sub org id',
    name: 'sub org name'
  };

  const testOrg: OrganizationDtoWithDetails = {
    ...testValidOrganization,
    subordinateOrganizations: [
      subOrg
    ]
  };
  const form = render(
    <OrganizationEditForm
      data={testOrg}
      formErrors={{}}
      onSubmit={() => { }}
      onPatch={onPatch}
      onClose={() => { }}
      isSubmitting={false}
      formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
      .getByDisplayValue(`${testOrg.leader!.firstName} ${testOrg.leader!.lastName}`))
      .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Subordinate Organizations (1)')).toBeVisible()
  );

  await expect(form.findByText(subOrg.name!)).resolves.toBeInTheDocument();

  // Find the checkbox
  const orgRow = await form.findByText(subOrg.name!);
  expect(orgRow.parentElement).toBeInTheDocument();
  const orgRowCheckbox = orgRow.parentElement?.querySelector('.ag-checkbox-input');
  expect(orgRowCheckbox).toBeInTheDocument();

  // Try to check it
  fireEvent.click(orgRowCheckbox!);
  expect(orgRowCheckbox).toBeChecked();

  // uncheck it
  fireEvent.click(orgRowCheckbox!);
  expect(orgRowCheckbox).not.toBeChecked();

  // Check it
  fireEvent.click(orgRowCheckbox!);
  expect(orgRowCheckbox).toBeChecked();

  const memberBtn = form.getByTestId('org-suborg-remove-selected__btn');
  await waitFor(
    () => expect(memberBtn).not.toBeDisabled()
  );
  fireEvent.click(memberBtn);

  await waitFor(
    () => expect(form.getByText('Organization Members (0)')).toBeVisible()
  )
});
