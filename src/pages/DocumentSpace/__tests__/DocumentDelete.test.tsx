import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto } from '../../../openapi';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import DeleteDocumentDialog from '../DocumentDelete';
import DocumentUploadDialog from '../DocumentUploadDialog';

jest.mock('../../../state/document-space/document-space-state');

describe('Document Delete Tests', () => {

  it('should render and fire appropriate events', async () => {

    const deleteMock = jest.fn();
    const submitMock = jest.fn();
    const page = render(<MemoryRouter>
      <DeleteDocumentDialog 
        file='some file'
        onCancel={deleteMock}
        onSubmit={submitMock}
        show={true}

      />
    </MemoryRouter>);

    const deleteBtn = page.getByText('Delete');
    fireEvent.click(deleteBtn);
    await waitFor(() => expect(submitMock).toHaveBeenCalled());

    const cancelBtn = page.getByText('Cancel');
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });
})