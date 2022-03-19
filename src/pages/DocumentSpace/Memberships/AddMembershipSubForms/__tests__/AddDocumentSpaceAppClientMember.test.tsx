import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToastContainer } from '../../../../../components/Toast/ToastContainer/ToastContainer';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../../../openapi';
import { documentSpaceMembershipService } from '../../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipService from '../../../../../state/document-space/memberships/document-space-membership-service';
import AddDocumentSpaceAppClientMember from '../AddDocumentSpaceAppClientMember';

jest.mock('../../../../../state/document-space/document-space-state');

describe('Adding App Client to Document Space', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  const onMemberChangeCallback = jest.fn();
  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should not allow a blank app client selection to submit', async () => {
    const spy = jest.spyOn(membershipService, 'getAvailableAppClientsForDocumentSpace').mockReturnValue(
      Promise.resolve([])
    );

    const page = render(
      <AddDocumentSpaceAppClientMember
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
    await waitFor(() => expect(page.getByText('Add App')).toBeDisabled());
  });

  it('should allow app client selection to submit and call the api', async () => {
    const spy = jest.spyOn(membershipService, 'getAvailableAppClientsForDocumentSpace').mockReturnValue(
      Promise.resolve([
        {
          id: 'sdfdsfsdf',
          name: 'app1',
        },
      ])
    );

    const submitSpy = jest
      .spyOn(membershipService, 'addDocumentSpaceAppClientMember')
      .mockReturnValue(Promise.resolve());

    const page = render(
      <AddDocumentSpaceAppClientMember
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
    await waitFor(() => expect(page.getByTestId('app-client-member-select')).not.toBeDisabled());
    userEvent.click(page.getByTestId('app-client-member-select'));
    await waitFor(() => expect(page.getByTestId('app1')).toBeTruthy());
    userEvent.click(page.getByTestId('app1'));
    await waitFor(() => expect(page.getByText('Add App')).not.toBeDisabled());
    userEvent.click(page.getByText('Add App'));

    await waitFor(() => expect(spy).toHaveBeenCalled());
    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    await expect(page.findByText('Successfully added App Client to Document Space')).resolves.toBeInTheDocument();
    await waitFor(() => expect(onMemberChangeCallback).toHaveBeenCalledTimes(1));
  });

  it('should handle error adding new app client', async () => {
    const spy = jest.spyOn(membershipService, 'getAvailableAppClientsForDocumentSpace').mockReturnValue(
      Promise.resolve([
        {
          id: 'sdfdsfsdf',
          name: 'app1',
        },
        {
          id: 'sdfdsfsdfssd',
          name: 'app2',
        },
      ])
    );

    const submitSpy = jest
      .spyOn(membershipService, 'addDocumentSpaceAppClientMember')
      .mockImplementation(() => Promise.reject('Error on api'));

    const page = render(
      <>
        <AddDocumentSpaceAppClientMember
          documentSpaceId={documentSpaceId}
          onMemberChangeCallback={onMemberChangeCallback}
        />
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </>
    );

    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
    await waitFor(() => expect(page.getByTestId('app-client-member-select')).not.toBeDisabled());
    userEvent.click(page.getByTestId('app-client-member-select'));
    await waitFor(() => expect(page.getByTestId('app1')).toBeTruthy());
    userEvent.click(page.getByTestId('app1'));
    await waitFor(() => expect(page.getByText('Add App')).not.toBeDisabled());
    userEvent.click(page.getByText('Add App'));

    await waitFor(() => expect(spy).toHaveBeenCalled());
    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    await expect(page.findByText('Failed to add App Client to Document Space')).resolves.toBeInTheDocument();
    expect(page.getByText(/error/i)).toBeInTheDocument();
  });
});
