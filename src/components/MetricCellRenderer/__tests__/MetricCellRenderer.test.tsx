import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import MetricCellRenderer from '../MetricCellRenderer';

describe('Metric Cell Renderer', () => {
  it('Renders correctly', async () => {
    const page = render(
      <MetricCellRenderer />
    );

    expect(page.getByTestId('metric-cell-renderer')).toBeTruthy();
  });

  it('Btn click handler', async () => {
    const onClick = jest.fn();

    const page = render(
      <MetricCellRenderer onClick={onClick} />
    );

    fireEvent.click(page.getByTitle("metric"));

    expect(onClick.mock.calls.length).toBe(1);
  });
});
