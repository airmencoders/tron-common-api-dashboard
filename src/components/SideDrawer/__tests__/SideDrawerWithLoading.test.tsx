import React from 'react';
import { render } from '@testing-library/react';
import SideDrawerWithLoading from '../SideDrawerWithLoading';

test('Loading state shown', async () => {
  const component = render(
    <SideDrawerWithLoading
      isLoading={true}
      onCloseHandler={() => { return; }}
      title="Test Sidedrawer"
      isOpen={true}
    >
      <div data-testid="side-drawer-loading-content">
        The Content
      </div>
    </SideDrawerWithLoading>
  );

  await expect(component.findByText('Loading...')).resolves.toBeInTheDocument();
});

