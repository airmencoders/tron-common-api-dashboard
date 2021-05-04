
import React, { useEffect, useRef } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import './CheckboxCellRenderer.scss';
import { CheckboxCellRendererProps } from './CheckboxCellRendererProps';
import { CheckboxStatusType } from '../forms/Checkbox/checkbox-status-type';
import { generateCheckboxTitle } from '../forms/Checkbox/checkbox-utils';

function CheckboxCellRenderer(props: Partial<ICellRendererParams> & CheckboxCellRendererProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const value = props.value;

    const checkbox = checkboxRef.current;
    if (checkbox) {
      if (typeof value === 'boolean') {
        checkbox.checked = value;
      } else {
        checkbox.checked = value === CheckboxStatusType.CHECKED;
        checkbox.indeterminate = value === CheckboxStatusType.INDETERMINATE;
      }
    }
  }, [props.value]);

  return (
    <div className="checkbox-cell-renderer" data-testid="checkbox-cell-renderer">
      <input
        id={`${props.idPrefix}-${props.rowIndex?.toString()}`}
        ref={checkboxRef}
        type="checkbox"
        onChange={(e) => props.onChange(props.data, e)}
        className="checkbox-cell-renderer__checkbox"
        title={generateCheckboxTitle(props.value)}
      />
    </div>
  );
}

export default CheckboxCellRenderer;
