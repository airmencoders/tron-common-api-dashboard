import {fireEvent, render, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import BatchUserUploadDialog from "../BatchUserUploadDialog";
import {createState, State, StateMethodsDestroy} from "@hookstate/core";
import {BatchUploadState} from "../DocumentSpaceMemberships";
import mockAxios from "axios";
import {
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceResponseDto
} from "../../../openapi";
import DocumentSpaceMembershipService from "../../../state/document-space/document-space-membership-service";
import {createAxiosSuccessResponse} from "../../../utils/TestUtils/test-utils";


jest.mock('axios')

describe('Document Delete Tests', () => {
  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceMembershipService: DocumentSpaceMembershipService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();

    documentSpaceMembershipService = new DocumentSpaceMembershipService(documentSpaceApi);

  });

  it('should render and fire appropriate events', async () => {

    const mockOnFinish = jest.fn();
    const testSpaceID = 'testId123'
    const batchUploadState = createState<BatchUploadState>({successErrorState:{successMessage: 'Successfully added members to Document Space', errorMessage: '', showSuccessMessage: false  , showErrorMessage: false, showCloseButton: true}})
    const response = createAxiosSuccessResponse<Array<string>>(['a', 'b', 'c']);

    let requestMade = false;
    (mockAxios.request as jest.Mock).mockImplementation((obj) => {
        if (obj.url.includes('/api/v2/document-space/spaces/testId123/batchUsers')) {
          requestMade = true;
          return Promise.resolve(response);
        }
      }
    );

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

    expect(mockOnFinish).toHaveBeenCalled();
    expect(requestMade).toBeTruthy();
  });
})