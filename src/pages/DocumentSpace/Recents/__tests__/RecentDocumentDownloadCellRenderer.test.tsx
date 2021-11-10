import { render } from '@testing-library/react';
import RecentDocumentDownloadCellRenderer from '../RecentDocumentDownloadCellRenderer';

describe('Recent Document Download Cell Renderer Tests', () => {
  it('should not render when no data exists', () => {
    const { queryByRole } = render(
      <RecentDocumentDownloadCellRenderer />
    );

    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render link when data exists', () => {
    const { getByRole } = render(
      <RecentDocumentDownloadCellRenderer
        value={{
          id: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
          key: 'testfile.txt',
          parentFolderId: '00000000-0000-0000-0000-000000000000',
          lastModifiedDate: 'string',
          documentSpace: {
            id: '412ea028-1fc5-41e0-b48a-c6ef090704d4',
            name: 'test space'
          }
        }}
      />
    );

    expect(getByRole('link')).toBeInTheDocument();
  });
});