import { render } from '@testing-library/react';
import RecentDocumentCellRenderer from '../RecentDocumentCellRenderer';

describe('Recent Document Cell Renderer Tests', () => {
  it('should render spinner when loading (no data passed in)', () => {
    const { getByText } = render(
      <RecentDocumentCellRenderer />
    );

    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render link', () => {
    const { getByRole } = render(
      <RecentDocumentCellRenderer
        data={{
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
})