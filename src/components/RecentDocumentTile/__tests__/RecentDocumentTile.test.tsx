import { render, waitFor } from '@testing-library/react';
import React from 'react';
import FileIcon from '../../../icons/FileIcon';
import RecentDocumentTile from '../RecentDocumentTile';

test('Tile is shown', async () => {
  const page = render(<RecentDocumentTile 
    fileName="test.txt"
    height={456}
    width={123}
    icon={<FileIcon size={1} />}
    parentFolderId="some id"
    timestamp={new Date().toISOString()}
    uploadedBy="Czell"
  />);
  await waitFor(
      () => expect(page.getByText('test.txt'))
          .toBeTruthy()
  )
});
