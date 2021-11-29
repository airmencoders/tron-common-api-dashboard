import React from 'react';
import { DocumentDto } from '../../../openapi';
import DocumentSpaceDownloadUrlService from '../document-space-download-url-service';

describe('Document Space Download File URL Service test', () => {
  const documents: DocumentDto[] = [
    {
      spaceId: '90f4d33b-b761-4a29-bcdd-1bf8fe46831c',
      key: 'file.txt',
      path: 'test/path',
      size: 1000,
      lastModifiedBy: '',
      lastModifiedDate: '2021-09-17T14:09:10.154Z',
    },
    {
      spaceId: '407bf847-5ac7-485c-842f-c9efaf8a6b5d',
      key: 'file2.txt',
      path: 'path/test',
      size: 20000,
      lastModifiedBy: '',
      lastModifiedDate: '2021-09-17T15:09:10.154Z',
    },
  ];

  let downloadUrlService: DocumentSpaceDownloadUrlService;

  beforeEach(() => {
    downloadUrlService = new DocumentSpaceDownloadUrlService();
  });

  it('should create relative download url for multi file download', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';

    const url = downloadUrlService.createRelativeFilesDownloadUrl(documentSpaceId, '/', documents);

    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/files/download?path=/&files=${documents.map(document => document.key).join(',')}`)).toBeTruthy();
  });

  it('should create relative download url for a single file download', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const fileKey = 'testfile.key';

    const url = downloadUrlService.createRelativeDownloadFileUrl(documentSpaceId, '/', fileKey);

    expect(url.endsWith(`/document-space/space/${documentSpaceId}/${fileKey}`)).toBeTruthy();
  });

  it('should create relative download url to download entire space', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';

    const url = downloadUrlService.createRelativeDownloadAllFilesUrl(documentSpaceId);

    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/files/download/all`)).toBeTruthy();
  });

  it('should create relative download url by Document Space and Parent', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const parentFolderId = '00000000-0000-0000-0000-000000000000';
    const filename = 'testfile.txt';

    // Test for preview link
    let url = downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}`)).toBeTruthy();

    // Test for direct download link
    url = downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId, parentFolderId, filename, true);
    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}?download=true`)).toBeTruthy();
  });
});
