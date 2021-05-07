import { fireEvent, render } from '@testing-library/react';
import CheckboxCellRenderer from '../CheckboxCellRenderer';

describe('Checkbox Cell Renderer', () => {
  it('Renders correctly', async () => {
    const page = render(
      <CheckboxCellRenderer
        idPrefix='test-id'
        onChange={() => { return }}
      />
    );

    expect(page.getByTestId('checkbox-cell-renderer')).toBeInTheDocument();
  });

  it('Checkbox click handler', async () => {
    const onChange = jest.fn();

    const page = render(
      <CheckboxCellRenderer
        rowIndex={1}
        idPrefix='test-id'
        onChange={onChange}
      />
    );

    const checkbox = page.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox!);

    expect(onChange.mock.calls.length).toBe(1);
  });
});
