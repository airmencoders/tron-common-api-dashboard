import React from 'react';
import { render } from '@testing-library/react';
import SideDrawer from '../SideDrawer';

test('Loading state shown', async () => {
  const component = render(
    <SideDrawer
      isLoading={true}
      onCloseHandler={() => { return; }}
      title="Test Sidedrawer"
      isOpen={true}
    >
      <div data-testid="side-drawer-loading-content">
        The Content
      </div>
    </SideDrawer>
  );

  await expect(component.findByText('Loading...')).resolves.toBeInTheDocument();
});

