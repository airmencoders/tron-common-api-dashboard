import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToastContainer } from '../../../../../components/Toast/ToastContainer/ToastContainer';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceDashboardMemberRequestDto } from '../../../../../openapi';
import { documentSpaceMembershipService } from '../../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipService from '../../../../../state/document-space/memberships/document-space-membership-service';
import { createAxiosSuccessResponse } from '../../../../../utils/TestUtils/test-utils';
import AddDocumentSpaceUserMember from '../AddDocumentSpaceUserMember';

jest.mock('../../../../../state/document-space/document-space-state');

describe('Adding Dashboard Users to Document Space', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  const onMemberChangeCallback = jest.fn();

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should show email validation', () => {
    const page = render(
      <AddDocumentSpaceUserMember
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    expect(page.queryByText('Add New Member')).toBeInTheDocument();
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
        <AddDocumentSpaceUserMember
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

    const response = jest.fn((_: string, dto: DocumentSpaceDashboardMemberRequestDto) => {
      expect(dto.privileges).toContain('WRITE');
      expect(dto.privileges).toContain('MEMBERSHIP');
      return Promise.resolve();
    });
    const addMemberSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockImplementation(response);

    expect(page.queryByText('Add New Member')).toBeInTheDocument();

    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    userEvent.type(emailField, 'test@email.com');

    const readPrivilegeCheckbox = page.getByLabelText('Admin');
    expect(readPrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(readPrivilegeCheckbox);

    const addBtn = page.getByText('Add User');
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
        <AddDocumentSpaceUserMember
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

    expect(page.queryByText('Add New Member')).toBeInTheDocument();

    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    userEvent.type(emailField, 'test@email.com');

    const writePrivilegeCheckbox = page.getByTestId('privilege_WRITE');
    expect(writePrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(writePrivilegeCheckbox);

    const addBtn = page.getByText('Add User');
    expect(addBtn).toBeEnabled();
    userEvent.click(addBtn);

    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMemberSpy).toHaveBeenCalledTimes(1));
    await expect(page.findByText('Failed to add Document Space member')).resolves.toBeInTheDocument();

    expect(page.getByText(/error/i)).toBeInTheDocument();
  });
});