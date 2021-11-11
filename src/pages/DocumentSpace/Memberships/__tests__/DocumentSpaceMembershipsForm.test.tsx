import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from '../../../../components/Toast/ToastContainer/ToastContainer';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../../openapi';
import DocumentSpaceMembershipService from '../../../../state/document-space/document-space-membership-service';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../../utils/TestUtils/test-utils';
import DocumentSpaceMembershipsForm from '../DocumentSpaceMembershipsForm';

jest.mock('../../../state/document-space/document-space-state');

describe('Document Space Membership Form Test', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  const onMemberChangeCallback = jest.fn();

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should render form', () => {
    const page = render(
      <DocumentSpaceMembershipsForm
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    expect(page.queryByText('Add Member')).toBeInTheDocument();
  });

  it('should show email validation', () => {
    const page = render(
      <DocumentSpaceMembershipsForm
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    expect(page.queryByText('Add Member')).toBeInTheDocument();
    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();

    // Bad Email validation
    userEvent.type(emailField, 'badEmail');
    expect(page.getByText(/Email is not valid/)).toBeInTheDocument();

    // Required field validation
    userEvent.clear(emailField);
    expect(page.getByText(/Cannot be blank or empty/)).toBeInTheDocument();
  });

  it('should send request when adding new user and show success toast on success', async () => {
    const page = render(
      <>
        <DocumentSpaceMembershipsForm
          documentSpaceId={documentSpaceId}
          onMemberChangeCallback={onMemberChangeCallback}
        />

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </>
    );

    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const addMemberSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockImplementation(response);

    expect(page.queryByText('Add Member')).toBeInTheDocument();

    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    userEvent.type(emailField, 'test@email.com');

    const readPrivilegeCheckbox = page.getByLabelText('WRITE');
    expect(readPrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(readPrivilegeCheckbox);

    const addBtn = page.getByText('Add');
    expect(addBtn).toBeEnabled();
    userEvent.click(addBtn);


    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMemberSpy).toHaveBeenCalledTimes(1));
    await expect(page.findByText('Successfully added member to Document Space')).resolves.toBeInTheDocument();
    await waitFor(() => expect(onMemberChangeCallback).toHaveBeenCalledTimes(1));

    expect(page.getByText('Successfully added member to Document Space')).toBeInTheDocument();
  });

  it('should send request when adding new user and show error toast on error', async () => {
    const page = render(
      <>
        <DocumentSpaceMembershipsForm
          documentSpaceId={documentSpaceId}
          onMemberChangeCallback={onMemberChangeCallback}
        />

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </>
    );

    const response = jest.fn(() => {
      return Promise.reject(new Error('error'));
    });
    const addMemberSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockImplementation(response);

    expect(page.queryByText('Add Member')).toBeInTheDocument();

    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    userEvent.type(emailField, 'test@email.com');

    const writePrivilegeCheckbox = page.getByLabelText('WRITE');
    expect(writePrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(writePrivilegeCheckbox);

    const addBtn = page.getByText('Add');
    expect(addBtn).toBeEnabled();
    userEvent.click(addBtn);

    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMemberSpy).toHaveBeenCalledTimes(1));
    await expect(page.findByText('Failed to add Document Space member')).resolves.toBeInTheDocument();

    expect(page.getByText(/error/i)).toBeInTheDocument();
  });
});
