import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import Select from '../forms/Select/Select';

/**
 * Un-opinionated combo box element for ag-grid cells
 */

export interface ComboBoxCellRendererProps {
  items: string[];
  selectedItem: (row: any) => string;
  onChange: (row: any, data: string) => void;
}

function ComboxBoxCellRenderer(props: Partial<ICellRendererParams> & ComboBoxCellRendererProps) {
  const data = props.node?.data;

  function handleSelectionChange(value: string) {
    props.onChange(data, value);
  }

  if (!data) {
    return null;
  }

  return (
    <div className="combobox-cell-renderer" data-testid="combobox-cell-renderer">
      <Select
        id={`combobox-${props.node?.data?.id}`}
        name={`combobox-${props.node?.data?.id}`}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleSelectionChange(event.currentTarget.value)}
        defaultValue={props.selectedItem(data)}
      >
        {props.items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
    </div>
  );
}

export default ComboxBoxCellRenderer;
