
import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import Checkbox from '../forms/Checkbox/Checkbox';
import './CheckboxCellRenderer.scss';
import { CheckboxCellRendererProps } from './CheckboxCellRendererProps';

function CheckboxCellRenderer(props: Partial<ICellRendererParams> & CheckboxCellRendererProps) {
  return (
    <div className="checkbox-cell-renderer" data-testid="checkbox-cell-renderer">
      <Checkbox
        id={`${props.idPrefix}-${props.rowIndex?.toString()}`}
        name="authorized"
        label={<></>}
        checked={props.value}
        onChange={(e) => props.onChange(props.data, e)}
        className="checkbox-cell-renderer__checkbox"
      />
    </div>
  );
}

export default CheckboxCellRenderer;
