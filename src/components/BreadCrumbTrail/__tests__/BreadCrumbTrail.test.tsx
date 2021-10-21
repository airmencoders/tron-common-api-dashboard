import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import BreadCrumbTrail from '../BreadCrumbTrail';
import { waitFor } from '@testing-library/dom';

describe('Bread Crumb Tests', () => {

  it('should show root element', async () => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={""} onNavigate={mock} />);
    const rootElement = page.getByTestId('path_element_root');
    await waitFor(() => expect(rootElement).toBeTruthy());
    fireEvent.click(rootElement);
    await waitFor(() => expect(mock).toHaveBeenCalled());
  });

  it('should show two components, but last item not linked', async() => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={"/root/path"} onNavigate={mock} />);
    const rootElement = page.getByTestId('path_element_root');
    const lastElement = page.getByTestId('breadcrumb-last-item')
    await waitFor(() => expect(rootElement).toBeTruthy());
    await waitFor(() => expect(lastElement).toBeTruthy());
    fireEvent.click(lastElement);
    await waitFor(() => expect(mock).not.toHaveBeenCalled());
  })

  it('show show other path components', async() => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={"/root/path/folder"} onNavigate={mock} />);
    const rootElement = page.getByTestId('path_element_root');
    const secondElement = page.getByTestId('path_element_0')
    await waitFor(() => expect(rootElement).toBeTruthy());
    await waitFor(() => expect(secondElement).toBeTruthy());
    fireEvent.click(secondElement);
    await waitFor(() => expect(mock).toHaveBeenCalled());
  })
})
