import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { documentSpaceDownloadUrlService } from '../../../state/document-space/document-space-state';
import Spinner from '../../../components/Spinner/Spinner';
import { RecentDocumentDto } from '../../../openapi';

function RecentDocumentCellRenderer(props: Partial<ICellRendererParams>) {

  const downloadUrlService = documentSpaceDownloadUrlService();
  const value = props.data as RecentDocumentDto;

  if (!value) {
    return <Spinner small />;
  }

  return (
    <div
      className="loading-cell-renderer"
      data-testid={`recent-item-cell-renderer__${value.id}`}
    >
      <a href={downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(
        value.documentSpace.id,
        value.parentFolderId,
        value.key
      )} target="_blank" rel="noreferrer">{value.key}</a>
    </div>
  );
}

export default RecentDocumentCellRenderer;
