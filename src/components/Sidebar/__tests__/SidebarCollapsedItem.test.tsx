import React from 'react';
import {render} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import SidebarCollapsedItem from '../SidebarCollapsedItem';
import {waitFor} from '@testing-library/dom';
import DownIcon from '../../../icons/DownIcon';

describe('SidebarCollapsedItem', () => {

  it('should render', async () => {
    const pageRender = render(
        <MemoryRouter>
          <SidebarCollapsedItem
              name="name"
              currentOpenedMenu="other"
              icon={DownIcon}
          />
        </MemoryRouter>
    );

    waitFor(() => expect(pageRender.getByTitle("down")));
  });
});
