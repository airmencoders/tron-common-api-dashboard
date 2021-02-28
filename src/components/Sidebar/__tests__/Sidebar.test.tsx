import React from 'react';
import { render } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { HealthPage } from '../../../pages/Health/HealthPage';
import { MemoryRouter } from 'react-router-dom';
import { RouteItem } from '../../../routes';
import PersonPage from '../../../pages/Person/PersonPage';

const testRoutes: RouteItem[] = [
  {
    path: "/health",
    name: "Health",
    component: HealthPage
  },
  {
    path: "/person",
    name: "Person",
    component: PersonPage
  }
];

function createRenderElem(routes: RouteItem[]) {
  return (
    <MemoryRouter>
      <Sidebar items={routes} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('Renders', () => {
    const pageRender = render(
      createRenderElem(testRoutes)
    );

    const elem = pageRender.getByTestId('sidebar');

    expect(elem).toBeInTheDocument();
  });

  it('Renders all items', () => {
    const pageRender = render(
      createRenderElem(testRoutes)
    );

    testRoutes.forEach((item) => {
      expect(pageRender.getByText(item.name)).toBeInTheDocument();
    });
  });
});
