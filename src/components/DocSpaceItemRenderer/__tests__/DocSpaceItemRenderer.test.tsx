import React from 'react';
import DocSpaceItemRenderer from '../DocSpaceItemRenderer';
import { DocumentDto } from '../../../openapi';
import { render } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';


describe('DocSpaceItemRenderer Tests', () => {

  it('should render a folder icon for a directory', async ()=> {
    const documentDto = { data: {folder: true, key: 'folder1'} as DocumentDto};
    const page = render(<DocSpaceItemRenderer node={documentDto} />);
    const cell = page.getByTestId(`docspace-item-cell-renderer__${ documentDto.data.key }`);
    const svg = page.getByTestId('svg-folder-icon');
    await waitFor(() => expect(cell).toContainElement(svg));
  })

  it('should render a file without an icon', async ()=> {
    const documentDto = { data: {folder: false, key: 'file1'} as DocumentDto};
    const page = render(<DocSpaceItemRenderer node={documentDto} />);
    const cell = page.getByTestId(`docspace-item-cell-renderer__${ documentDto.data.key }`);
    const svg = page.queryByTestId('svg-folder-icon');
    await waitFor(() => expect(cell).not.toContainElement(svg));
  })
})
