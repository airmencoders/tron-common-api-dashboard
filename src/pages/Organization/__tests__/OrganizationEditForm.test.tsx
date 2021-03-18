import { createState, useState } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { OrganizationControllerApi, PersonControllerApi, RankControllerApi } from '../../../openapi';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../openapi/models';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import OrganizationService, { OrgEditOpType } from '../../../state/organization/organization-service';
import { OrganizationDtoWithDetails, useOrganizationState } from '../../../state/organization/organization-state';
import PersonService from '../../../state/person/person-service';
import { usePersonState } from '../../../state/person/person-state';
import { RankStateModel } from '../../../state/person/rank-state-model';
import OrganizationEditForm from '../OrganizationEditForm';

jest.mock('../../../state/person/person-state');
jest.mock('../../../state/organization/organization-state');

class MockPersonService extends PersonService { }
class MockOrganizationService extends OrganizationService { }

// represents an organization returned from a GET to
//   .../organization/:id?people="id,firstName,lastName",organizations="id,name"
let originalLeader = { id: 'some id', firstName: 'Frank', lastName: 'Summers' };
const existingOrg = {
    id: '13c23dd4-e0d5-4d05-8237-8b88f582b114',
    members: [ { id: 'some id', firstName: 'jon', lastName: 'public' }],
    parentOrganization: { id: 'some id', name: 'Parent' },
    subordinateOrganizations: [ { id: 'some id', name: 'some org'}],
    leader: originalLeader,
    branchType: 'USAF',
    orgType: 'SQUADRON'
};

let mockUseOrganizationState : any = undefined;
let mockUsePersonState : any = undefined;

beforeEach(() => {
  jest.useFakeTimers();
  mockUsePersonState =  (usePersonState as jest.Mock).mockImplementation(() => new MockPersonService(
    useState(createState<PersonDto[]>([
      {id: 'some id', firstName: 'Joey', lastName: 'JoJo', email: 'jj@gmail.com'},
      {id: 'some id', firstName: 'Homer', lastName: 'Simpson', email: 'hs@gmail.com'}
    ])),
    new PersonControllerApi(),
    useState(createState<RankStateModel>({})),
    new RankControllerApi()
  ));

  mockUseOrganizationState =  (useOrganizationState as jest.Mock).mockImplementation(() => new MockOrganizationService(
    useState(createState<OrganizationDto[]>([testValidOrganization, { id: '1', name: 'some2'}])),
    useState(createState<OrganizationDtoWithDetails>(existingOrg as OrganizationDtoWithDetails)),
    new OrganizationControllerApi()
  ));

})
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();


  mockUsePersonState.mockRestore();
  mockUseOrganizationState.mockRestore();
  existingOrg.leader = originalLeader;
});

const testOrganization: OrganizationDto = {
};

const membersSet = new Set<string>();
membersSet.add('some id');

const subOrgsSet = new Set<string>();
subOrgsSet.add('some id');

const testValidOrganization: OrganizationDto = {
  id: 'some id',
  name: 'TestOrg',
  leader: 'some leader id',
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

it('should allow to chose parent', async () => { 
  

  let opHappened = false;
  const form = render(
    <OrganizationEditForm
        data={testValidOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args : any)=> {
          if (args[0] === OrgEditOpType.PARENT_ORG_EDIT) {
            opHappened = true;
          }
        }}
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => {
        expect(form
          .getByDisplayValue(`${existingOrg.parentOrganization.name}`))
          .toBeInTheDocument();        
      }
  );

  const parentBtn = await form.getByTestId('change-org-parent__btn');
  fireEvent.click(parentBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );

  const orgRow = await form.getByText('some2');
  fireEvent.click(orgRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByDisplayValue('some2')).toBeInTheDocument()   
  );

  // ack the dialog selection to set the parent
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  await waitFor(
    () => {
      expect(form
        .getByDisplayValue('TestOrg'))
        .toBeInTheDocument();

        expect(opHappened).toBeTruthy();
    }
  );

});


it('should allow to remove parent', async () => {  
  let opHappened = false;
  const form = render(
      <OrganizationEditForm
          data={testValidOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onPatch={(...args:any) => {
            if (args[0] === OrgEditOpType.PARENT_ORG_REMOVE) opHappened = true;
          }}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.UPDATE}
      />
  );
  await waitFor(
      () => expect(form
          .getByDisplayValue(`${existingOrg.parentOrganization.name}`))
          .toBeInTheDocument()
  )

  const parentBtn = await form.getByTestId('remove-org-parent__btn');
  fireEvent.click(parentBtn);

  await waitFor(
    () => expect(form.getByTestId('remove-confirm-ok__btn')).toBeVisible()
  );

  const okBtn = form.getByTestId('remove-confirm-ok__btn');
  fireEvent.click(okBtn);

  await waitFor(
    () => expect(opHappened).toBeTruthy()
  );

});


it('should allow to chose leader', async () => {
  
  let opHappened = false
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args : any) => {
          if (args[0] === OrgEditOpType.LEADER_EDIT) {
            existingOrg.leader.firstName = 'Joey';
            existingOrg.leader.lastName = 'JoJo';
            opHappened = true;
          }
        }}
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
        .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
        .toBeInTheDocument()
  );

  const leaderBtn = await form.getByTestId('change-org-leader__btn');
  fireEvent.click(leaderBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );

  // close dialog
  const closeCloseBtn = await form.getByTestId('chooser-cancel__btn');
  fireEvent.click(closeCloseBtn); 

  fireEvent.click(leaderBtn);

  // re-open dialog
  await waitFor(
  () => {
      expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
  });

  const personRow = await form.getByText('Joey');
  fireEvent.click(personRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByTestId('chosen-person-row')).toHaveValue('Joey')   
  );

  // ack the dialog selection to set the leader
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  await waitFor(
    () => {
        expect(form
          .getByDisplayValue('Joey JoJo'))
          .toBeInTheDocument();

        expect(opHappened).toBeTruthy();
      }
  );

});


it('should allow to remove leader', async () => {

  let opHappenend = false;
  const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
          onPatch={(...args:any) => {
            if (args[0] === OrgEditOpType.LEADER_REMOVE) {
              existingOrg.leader = {id: '', firstName: '', lastName: ''};
              opHappenend = true;
            }
          }}
          onClose={() => {}}
          isSubmitting={false}
          formActionType={FormActionType.UPDATE}
      />
  );

  await waitFor(
      () => expect(form
          .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
          .toBeInTheDocument()
  )

  const leaderBtn = await form.getByTestId('remove-org-leader__btn');
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

  await waitFor(
    () => expect(opHappenend).toBeTruthy()
  );

});

it('should allow to add new member', async () => {
  let opHappened = false;
  const form = render(
    <OrganizationEditForm
        data={testValidOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args : any) => {
            if (args[0] === OrgEditOpType.MEMBERS_EDIT) opHappened = true;
          }
        }
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => expect(form
          .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
          .toBeInTheDocument()
  )

  await waitFor(
      () => expect(form.getByText('Organization Members (1)')).toBeVisible()
  )
  
  const memberBtn = await form.getByTestId('org-add-member__btn');
  fireEvent.click(memberBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();          
      }
  );

  const personRow = await form.getByText('Homer');
  fireEvent.click(personRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByTestId('chosen-person-row')).toHaveValue('Homer')   
  );

  // ack the dialog selection to set the leader
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  await waitFor( 
    () => expect(opHappened).toBeTruthy()
  );

});

it('should allow to remove a member', async () => {
  let opHappened = false;
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args : any) => { opHappened = true}}
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
        .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
        .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Organization Members (1)')).toBeVisible()
  )

  const selectAllMembersBtn = form.getByTestId('org-member-select-all__btn');
  fireEvent.click(selectAllMembersBtn);

  const memberBtn = form.getByTestId('org-member-remove-selected__btn');
  fireEvent.click(memberBtn);

  await waitFor(
    () => expect(opHappened).toBeFalsy()
  )
});

it('should allow to add new sub org', async () => {
  let opHappened = false;
  const form = render(
    <OrganizationEditForm
        data={testValidOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args : any) => {
          if (args[0] === OrgEditOpType.SUB_ORGS_EDIT) opHappened = true;
        }
        }
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
      () => expect(form
          .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
          .toBeInTheDocument()
  )

  await waitFor(
      () => expect(form.getByText('Subordinate Organizations (1)')).toBeVisible()
  )

  const subBtn = await form.getByTestId('org-add-suborg__btn');
  fireEvent.click(subBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );
  const personRow = await form.getByText('some2');
  fireEvent.click(personRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByDisplayValue('some2')).toBeInTheDocument()   
  );

  // ack the dialog selection to set the leader
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  await waitFor( 
    () => expect(opHappened).toBeTruthy()
  );

});

it('should allow to remove a sub org', async () => {
  let counter = 0
  const form = render(
    <OrganizationEditForm
        data={testValidOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onPatch={(...args:any) => { counter++; }}
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
        .getByDisplayValue(`${existingOrg.leader.firstName} ${existingOrg.leader.lastName}`))
        .toBeInTheDocument()
  )

  await waitFor(
    () => expect(form.getByText('Subordinate Organizations (1)')).toBeVisible()
  );

  const selectAllMembersBtn = await form.getByTestId('org-suborg-select-all__btn');
  fireEvent.click(selectAllMembersBtn);

  const memberBtn = await form.getByTestId('org-suborg-remove-selected__btn');
  fireEvent.click(memberBtn);

  await waitFor(
    () => expect(counter).toEqual(0)
 );



});
