import {render, waitFor, fireEvent} from '@testing-library/react';
import OrganizationEditForm from '../OrganizationEditForm';
import {OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum} from '../../../openapi/models';
import {FormActionType} from '../../../state/crud-page/form-action-type';
import {setupServer} from "msw/node";
import {rest} from "msw";


const existingOrg = {
    id: 'some id',
    members: [ { id: 'some id', firstName: 'jon', lastName: 'public' }],
    subordinateOrganizations: [ { id: 'some id', name: 'some org '}],
    leader: { id: 'some id', firstName: 'Frank', lastName: 'Summers' },
    branchType: 'USAF',
    orgType: 'SQUADRON'
};

const server = setupServer(
    rest.get('/api/v1/organization/:id',
        (req, res, ctx) => {
      return res(ctx.json(existingOrg))}),
    rest.get('/api/v1/person', (req, res, ctx) => {
      return res(ctx.json([{}]))
    }),
    rest.get('/api/v1/organization', (req, res, ctx) => {
        return res(ctx.json([]))
    }),
    rest.get('/api/v1/userinfo', (req, res, ctx) => {
        return res(ctx.json({}))
    }),
    rest.patch('/api/v1/organization/:id/leader', (req, res, ctx) => {
        return res(ctx.json({}))
    }),
    rest.get('*', req => console.log(req.url.href))
)

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const testOrganization: OrganizationDto = {
};

const testValidOrganization: OrganizationDto = {
  name: 'TestOrg',
  leader: 'some leader id',
  members: [ 'some ID' ],
  subordinateOrganizations: [ 'some id' ],
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

  const leaderBtn = await form.getByTestId('change-org-leader__btn');
  fireEvent.click(leaderBtn, new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
  }));

  await waitFor(
      () => {
          expect(form.getByTestId('chooser-ok-btn')).toBeVisible();
      }
  );
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

    const orgLeaderField = await form.getByTestId('org-leader-name');
    expect(orgLeaderField).toHaveValue('');
    const leaderBtn = await form.getByTestId('remove-org-leader__btn');
    fireEvent.click(leaderBtn, new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
    }));

    await waitFor(
        () => {
            expect(orgLeaderField).toHaveValue('');
        }
    );
});
