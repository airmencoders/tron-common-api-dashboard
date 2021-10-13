import { render } from '@testing-library/react';
import { RowNode } from 'ag-grid-community';
import DocumentDownloadCellRenderer from '../DocumentDownloadCellRenderer';

describe('Document Download Cell Renderer Test', () => {
  const node = {
    data: {
      key: 'Test File.txt',
      path: 'testspace',
      spaceId: 'testspace',
      uploadedBy: '',
      uploadedDate: '2021-09-17T20:20:51.102Z'
    }
  } as unknown as RowNode;

  it('should render when given space and key', async () => {
    const page = render(
      <DocumentDownloadCellRenderer node={node} />
    );

    expect(page.getByTitle(`Download ${node.data.key}`)).toBeInTheDocument();
  });

  it('should render nothing when space and key do not exist', async () => {
    const page = render(
      <DocumentDownloadCellRenderer />
    );

    expect(page.queryByTitle(`Download ${node.data.key}`)).not.toBeInTheDocument();
  });
});
