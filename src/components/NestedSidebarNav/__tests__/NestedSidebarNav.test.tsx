import React, {useState} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import NestedSidebarNav from '../NestedSidebarNav';

test('it should exist', async () => {
  render(
      <NestedSidebarNav id="test" title="Test"
                        isOpened={false}
                        onToggleClicked={() => {}}>
        <div>Test Child</div>
      </NestedSidebarNav>
  );
  await waitFor(
      () => expect(screen.getByText('Test')).toBeTruthy()
  );
});

const MockSidebarWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleClick = (id: string) => {
    setIsOpen(!isOpen);
  }
  return (
      <NestedSidebarNav id="test" title="Test"
                        isOpened={isOpen}
                        onToggleClicked={handleToggleClick}>
        <div>Test Child</div>
      </NestedSidebarNav>
  );
}
test('should make visible children when opened', async () =>{
  render(<MockSidebarWrapper/>);
  await waitFor(
      () => expect(screen.queryByText('Test')).not.toHaveClass('opened')
  );
  fireEvent(
      screen.getByTestId('header__link'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
  );
  await waitFor(
      () => expect(screen.getByTestId('nested-sidebar-nav__children')).toHaveClass('opened')
  );
});

