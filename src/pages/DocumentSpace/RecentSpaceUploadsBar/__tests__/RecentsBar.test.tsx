import { createState } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { DocumentSpaceControllerApi, DocumentSpaceResponseDto } from '../../../../openapi';
import DocumentSpaceDownloadUrlService from '../../../../state/document-space/document-space-download-url-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import {
  documentSpaceDownloadUrlService,
  useDocumentSpaceState
} from '../../../../state/document-space/document-space-state';
import RecentsBar from '../RecentsBar';

jest.mock('../../../../state/document-space/document-space-state');

describe('RecentsBar Test', () => {
  
  it('should not render when no recents available', async () => {
    const page = render(<RecentsBar recents={[]} />);
    await waitFor(() => expect(page.queryByText('Recent Activity')).toBeFalsy());
  });

  it('should render when recents available and downloads file when clicked', async () => {
    const docSpaceApi = new DocumentSpaceControllerApi();
    const docServiceState = createState<DocumentSpaceResponseDto[]>([]);
    const docService = new DocumentSpaceService(docSpaceApi, docServiceState);
    const serviceSpy = jest.spyOn(docService, 'getDocumentSpaceEntryPath').mockImplementation(() => Promise.resolve(''));

    const downloadService = new DocumentSpaceDownloadUrlService();
    const downloadSpy = jest.spyOn(downloadService, 'createRelativeDownloadFileUrl').mockImplementation(() => '');

    (useDocumentSpaceState as jest.Mock).mockReturnValue(docService);
    (documentSpaceDownloadUrlService as jest.Mock).mockReturnValue(downloadService);

    const page = render(<RecentsBar recents={[
      {
        documentSpace: { id: 'id', name: 'space' },
        id: 'id',
        key: 'file',
        lastModifiedDate: new Date().toISOString(),
        parentFolderId: 'parent',
        lastActivityBy: 'you',
      }
    ]} />);
    await waitFor(() => expect(page.queryByText('Recent Activity')).toBeTruthy());
    await waitFor(() => expect(page.queryByText('file')).toBeTruthy());
    fireEvent.click(page.getByText('file'));
    await waitFor(() => expect(serviceSpy).toHaveBeenCalled());
    await waitFor(() => expect(downloadSpy).toHaveBeenCalled());
  });

});