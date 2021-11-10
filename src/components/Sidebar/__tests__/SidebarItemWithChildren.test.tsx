import React from 'react';
import {render} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {waitFor} from '@testing-library/dom';
import SidebarItemWithChildren from '../SidebarItemWithChildren';
import {RouteItem} from '../../../routes';

describe('SidebarItemWithChildren', () => {

  it('should render opened', async () => {
    const routeItem: RouteItem = {
      path: '/test',
      name: 'Test',
      requiredPrivileges: [],
      childRoutes: [
        {
          path: '/test/child',
          name: 'Child',
          requiredPrivileges: []
        }
      ]
    }
    const pageRender = render(
        <MemoryRouter>
          <SidebarItemWithChildren
              item={routeItem}
              isNavCollapsed={false}
              openedMenu="other"
              onToggleClicked={(navItemClicked => {})}
          />
        </MemoryRouter>
    );

    waitFor(() => expect(pageRender.getByText("Child")));
  });

  it('should render closed', async () => {
    const routeItem: RouteItem = {
      path: '/test',
      name: 'Test',
      requiredPrivileges: [],
      childRoutes: [
        {
          path: '/test/child',
          name: 'Child',
          requiredPrivileges: []
        }
      ]
    }
    const pageRender = render(
        <MemoryRouter>
          <SidebarItemWithChildren
              item={routeItem}
              isNavCollapsed={true}
              openedMenu="other"
              onToggleClicked={(navItemClicked => {})}
          />
        </MemoryRouter>
    );

    waitFor(() => expect(pageRender.getByText("Child")).toBeFalsy());
  });
});
