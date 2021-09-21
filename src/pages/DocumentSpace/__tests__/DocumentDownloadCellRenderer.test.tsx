import { render } from '@testing-library/react';
import { DocumentDto } from '../../../openapi';
import DocumentDownloadCellRenderer from '../DocumentDownloadCellRenderer';

describe('Document Download Cell Renderer Test', () => {
  const data: DocumentDto = {
    key: 'Test File.txt',
    path: 'testspace',
    uploadedBy: '',
    uploadedDate: '2021-09-17T20:20:51.102Z'
  };

  it('should render when given space and key', async () => {
    const page = render(
      <DocumentDownloadCellRenderer data={data} />
    );

    expect(page.getByTitle(`Download ${data.key}`)).toBeInTheDocument();
  });

  it('should render nothing when space and key do not exist', async () => {
    const page = render(
      <DocumentDownloadCellRenderer />
    );

    expect(page.queryByTitle(`Download ${data.key}`)).not.toBeInTheDocument();
  });
});