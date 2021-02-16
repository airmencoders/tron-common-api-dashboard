import React from 'react'
import { render, screen } from '@testing-library/react'

import SideDrawer from '../SideDrawer'

describe('SideDrawer', () => {
  it('renders', () => {
    const onCloseHandler = jest.fn();

    const pageRender = render(
      <SideDrawer title="SideDrawer Test" isOpen={true} onCloseHandler={onCloseHandler}>
        Test Test
      </SideDrawer>
    );

    const elem = pageRender.getByTestId('side-drawer');

    expect(elem).toBeInTheDocument();
    expect(screen.getByText('SideDrawer Test')).toBeTruthy();
    expect(screen.getByText('Test Test')).toBeTruthy();
  });

  it('renders closed', () => {
    const onCloseHandler = jest.fn();

    const pageRender = render(
      <SideDrawer title='SideDrawer Test' isOpen={false} onCloseHandler={onCloseHandler}>
        Test Test
      </SideDrawer>
    );

    const elem = pageRender.getByTestId('side-drawer');

    expect(elem).toBeInTheDocument();
    expect(elem).not.toHaveClass('open');
  });
})