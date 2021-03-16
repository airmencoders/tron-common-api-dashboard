import { fireEvent, render, waitFor } from '@testing-library/react';
import { rest } from "msw";
import { setupServer } from "msw/node";
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum } from '../../../openapi/models';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import OrganizationEditForm from '../OrganizationEditForm';

// transforms a "custom org" back to a OrgDto
const transformOrgToOrgDto = (org: any) => {
  return { ...org, 
    members: org.members.map((i:any) => i.id), 
    leader: org.leader.id,
    subordinateOrganizations: org.members.map((i:any) => i.id)
  }
}

// represents an organization returned from a GET to
//   .../organization/:id?people="id,firstName,lastName",organizations="id,name"
const existingOrg = {
    id: '13c23dd4-e0d5-4d05-8237-8b88f582b114',
    members: [ { id: 'some id', firstName: 'jon', lastName: 'public' }],
    parentOrganization: { id: 'some id', name: 'Parent' },
    subordinateOrganizations: [ { id: 'some id', name: 'some org '}],
    leader: { id: 'some id', firstName: 'Frank', lastName: 'Summers' },
    branchType: 'USAF',
    orgType: 'SQUADRON'
};

let currentOrg = existingOrg;
let requestCounter = 0;  // general purpose counter used in some tests below (look there)

const server = setupServer(
    rest.get('/api/v1/organization/*',
      (req, res, ctx) => {
          return res(ctx.json(currentOrg))
    }),
    rest.get('/api/v1/person', (req, res, ctx) => {
      return res(ctx.json([ 
        {id: 'some id', firstName: 'Joey', lastName: 'JoJo', email: 'jj@gmail.com'},
        {id: 'some id', firstName: 'Homer', lastName: 'Simpson', email: 'hs@gmail.com'},
      ]))
    }),
    rest.get('/api/v1/organization', (req, res, ctx) => {
      return res(ctx.json([ { id: 'some id', name: 'blah'}]));
    }),
    rest.get('/api/v1/userinfo', (req, res, ctx) => {
      return res(ctx.json({}));
    }),
    rest.patch('/api/v1/organization/:id/members', (req, res, ctx) => {
      return res(ctx.json({}));
    }),
    rest.patch('/api/v1/organization/:id/subordinates', (req, res, ctx) => {
      return res(ctx.json({}));
    }),
    rest.patch('/api/v1/organization/:id', (req, res, ctx) => {
      console.log(transformOrgToOrgDto(currentOrg));
      return res(ctx.json(transformOrgToOrgDto(currentOrg)))
    }),
    rest.delete('/api/v1/organization/:id/leader', (req, res, ctx) => {
      requestCounter++;
      return res(ctx.json({}))
    }),
    rest.delete('/api/v1/organization/:id/parent', (req, res, ctx) => {
      requestCounter++;
      return res(ctx.json({}))
    }),
    rest.delete('/api/v1/organization/:id/members', (req, res, ctx) => {
      requestCounter++;
      return res(ctx.json({}))
    }),
    rest.delete('/api/v1/organization/:id/subordinates', (req, res, ctx) => {
      requestCounter++;
      return res(ctx.json({}))
    }),
    rest.get('*', req => console.log(req.url.href))
)

beforeAll(() => server.listen());
beforeEach(() => {
  jest.useFakeTimers();
})
afterEach(() => {
  server.resetHandlers();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
afterAll(() => server.close());

const testOrganization: OrganizationDto = {
};

const membersSet = new Set<string>();
membersSet.add('some id');

const subOrgsSet = new Set<string>();
subOrgsSet.add('some id');

const testValidOrganization: OrganizationDto = {
  name: 'TestOrg',
  leader: 'some leader id',
  members: membersSet,
  subordinateOrganizations: subOrgsSet,
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
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
        onClose={() => {}}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
    />
  );

  await waitFor(
    () => expect(form
        .getByDisplayValue(`${existingOrg.parentOrganization.name}`))
        .toBeInTheDocument()
  );

  const parentBtn = await form.getByTestId('change-org-parent__btn');
  fireEvent.click(parentBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );

  const orgRow = await form.getByText('blah');
  fireEvent.click(orgRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByDisplayValue('blah')).toBeInTheDocument()   
  );

  // ack the dialog selection to set the leader
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  currentOrg.parentOrganization = { id: '216d8f9d-c98b-4adf-910c-55ac8eb3b203', name: 'blah2'};

  await waitFor(
    () => expect(form
        .getByDisplayValue('blah2'))
        .toBeInTheDocument()
  );


  // restore the org data
  currentOrg = existingOrg;

});


it('should allow to remove parent', async () => {
    const form = render(
        <OrganizationEditForm
            data={testOrganization}
            formErrors={{}}
            onSubmit={() => {}}
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
      () => expect(requestCounter).toBeGreaterThan(0)
    );

    requestCounter=0;
});


it('should allow to chose leader', async () => {
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
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
    }
);

  const personRow = await form.getByText('Joey');
  fireEvent.click(personRow);

  // wait for the state change to be detected --- which we do via watching
  //  hidden element 'hidden-selected-item'
  await waitFor(
    () => expect(form.getByDisplayValue('Joey')).toBeInTheDocument()   
  );

  // ack the dialog selection to set the leader
  const okBtn = await form.getByTestId('chooser-ok__btn');
  fireEvent.click(okBtn);

  currentOrg.leader = { id: '216d8f9d-c98b-4adf-910c-55ac8eb3b203', firstName: 'Joey', lastName: 'JoJo'};

  await waitFor(
    () => expect(form
        .getByDisplayValue('Joey JoJo'))
        .toBeInTheDocument()
  );


  // restore the org data
  currentOrg = existingOrg;

});


it('should allow to remove leader', async () => {
    const form = render(
        <OrganizationEditForm
            data={testOrganization}
            formErrors={{}}
            onSubmit={() => {}}
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
      () => expect(requestCounter).toBeGreaterThan(0)
    );

    requestCounter=0;
});

it('should allow to add new member', async () => {
    const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
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

    // restore the org data
    currentOrg = existingOrg;

});

it('should allow to remove a member', async () => {
    const form = render(
      <OrganizationEditForm
          data={testOrganization}
          formErrors={{}}
          onSubmit={() => {}}
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
  
    const selectAllMembersBtn = await form.getByTestId('org-member-select-all__btn');
    fireEvent.click(selectAllMembersBtn);

    const memberBtn = await form.getByTestId('org-member-remove-selected__btn');
    fireEvent.click(memberBtn);

   await waitFor(
       () => expect(requestCounter).toBeGreaterThan(0)
   );

   requestCounter = 0;
});

it('should allow to add new sub org', async () => {
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
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

  const memberBtn = await form.getByTestId('org-add-suborg__btn');
  fireEvent.click(memberBtn);

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok__btn')).toBeVisible();
      }
  );
});

it('should allow to remove a sub org', async () => {
  const form = render(
    <OrganizationEditForm
        data={testOrganization}
        formErrors={{}}
        onSubmit={() => {}}
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

  const selectAllMembersBtn = await form.getByTestId('org-suborg-select-all__btn');
  fireEvent.click(selectAllMembersBtn);

  const memberBtn = await form.getByTestId('org-suborg-remove-selected__btn');
  fireEvent.click(memberBtn);

  await waitFor(
     () => expect(requestCounter).toBeGreaterThan(0)
  );

  requestCounter = 0;
});
