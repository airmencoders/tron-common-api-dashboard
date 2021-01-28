import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SidebarItem from '../SidebarItem';

const path = "/health";
const name = "Health";

describe('SidebarItem', () => {
  it('Renders', () => {
    const pageRender = render(
      <MemoryRouter>
        <SidebarItem path={path} name={name} />
      </MemoryRouter>
    );

    const elem = pageRender.getByTestId('sidebar-item');

    expect(elem).toBeInTheDocument();
  });

  it('Renders home "/" correctly', () => {
    const pageRender = render(
      <MemoryRouter>
        <SidebarItem path={"/"} name={name} />
      </MemoryRouter>
    );

    const elem = pageRender.getByTestId('sidebar-item');

    expect(elem).toBeInTheDocument();
  });
});