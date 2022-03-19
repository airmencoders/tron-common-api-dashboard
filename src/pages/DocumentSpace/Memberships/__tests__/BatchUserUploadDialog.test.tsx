import {fireEvent, render, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import BatchUserUploadDialog from '../BatchUserUploadDialog';
import {createState} from '@hookstate/core';
import {BatchUploadState} from '../DocumentSpaceMembershipsDrawer';
import {createAxiosSuccessResponse} from '../../../../utils/TestUtils/test-utils';
import {DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface} from '../../../../openapi';
import DocumentSpaceMembershipService from '../../../../state/document-space/memberships/document-space-membership-service';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';

jest.mock('../../../../state/document-space/document-space-state');
describe('Document Delete Tests', () => {
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should render and fire appropriate events', async () => {

    const mockOnFinish = jest.fn();
    const testSpaceID = 'testId123'
    const batchUploadState = createState<BatchUploadState>({successErrorState:{successMessage: 'Successfully added members to Document Space', errorMessage: '', showSuccessMessage: false  , showErrorMessage: false, showCloseButton: true}})
    const response = createAxiosSuccessResponse<Array<string>>(['a', 'b', 'c']);

    const serviceSpy = jest.spyOn(membershipService, 'batchAddUserToDocumentSpace').mockReturnValue(Promise.resolve(response));

    const {getByTestId} = render(<MemoryRouter>
      <BatchUserUploadDialog batchUploadState={batchUploadState} documentSpaceId={testSpaceID} onFinish={mockOnFinish}/>
    </MemoryRouter>);

    const btn = getByTestId('user-file-uploader-input');
    fireEvent.click(btn);

    await waitFor(() =>
      fireEvent.change(getByTestId('user-file-uploader-input'), {
        target: { files: [ 'some-file' ] },
      })
    );

    await waitFor(() => expect(serviceSpy).toHaveBeenCalled());
    await waitFor(() => expect(mockOnFinish).toHaveBeenCalled());
  });
})