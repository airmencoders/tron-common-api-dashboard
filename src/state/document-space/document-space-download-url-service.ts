import Config from '../../api/config';
import { DocumentDto } from '../../openapi';

export default class DocumentSpaceDownloadUrlService {
  createRelativeFilesDownloadUrl(id: string, path: string, documents: DocumentDto[]) {
    const fileKeysParam = documents.map(document => document.key).join(',');
    return `${Config.API_URL_V2}` + (`document-space/spaces/${id}/files/download?path=${path}&files=${fileKeysParam}`).replace(/[\/]+/g, '/');
  }

  createRelativeDownloadFileUrl(id: string, path: string, key: string, asDownload = false): string {
    const downloadLink = `${Config.API_URL_V2}` + (`document-space/space/${id}/${path}/${key}`.replace(/[\/]+/g, '/'));  // remove any repeated '/'s
    return asDownload ? downloadLink + '?download=true' : downloadLink;
  }

  createRelativeDownloadAllFilesUrl(id: string): string {
    return `${Config.API_URL_V2}document-space/spaces/${id}/files/download/all`;
  }

  createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId: string, parentFolderId: string, filename: string, asDownload = false): string {
    return `${Config.API_URL_V2}` + (`document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}${asDownload ? '?download=true' : ''}`.replace(/[\/]+/g, '/'));  // remove any repeated '/'s
  }
}
