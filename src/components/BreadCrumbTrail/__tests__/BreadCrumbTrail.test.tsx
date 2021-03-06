import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import BreadCrumbTrail from '../BreadCrumbTrail';
import { waitFor } from '@testing-library/dom';

describe('Bread Crumb Tests', () => {

  it('should show root element', async () => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={""} onNavigate={mock} />);
    const rootElement = page.getByTestId('path_element_root');
    expect(rootElement).toBeInTheDocument();
  });

  it('should allow clickable root element when multiple path elements exist', async () => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={"/testFolder"} onNavigate={mock} />);
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

  it('should show other path components', async() => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={"/root/path/folder"} onNavigate={mock} />);
    const rootElement = page.getByTestId('path_element_root');
    const secondElement = page.getByTestId('path_element_0')
    await waitFor(() => expect(rootElement).toBeTruthy());
    await waitFor(() => expect(secondElement).toBeTruthy());
    fireEvent.click(secondElement);
    await waitFor(() => expect(mock).toHaveBeenCalled());
  })

  it('should collapse the crumbs when exceeds MAX DEPTH', async() => {
    const mock = jest.fn();
    const page = render(<BreadCrumbTrail path={"/root/path/folder/that/is/very/really/long"} onNavigate={mock} />);
    const dropDownElement = page.getByTestId('collapsed-path-ellipsis');
    fireEvent.click(dropDownElement);
    await waitFor(() => expect(page.getByTestId('path_element_0')).toBeVisible());
    await waitFor(() => expect(page.getByTestId('path_element_1')).toBeVisible());
    await waitFor(() => expect(page.getByTestId('path_element_2')).toBeVisible());
    await waitFor(() => expect(page.getByTestId('path_element_3')).toBeVisible());
    await waitFor(() => expect(page.getByTestId('path_element_4')).toBeVisible());
    fireEvent.click(page.getByTestId('path_element_4'));
    await waitFor(() => expect(mock).toHaveBeenCalled());
  })
})
