import React from 'react';
import { ChooserProps } from './ChooserProps';
import Grid from '../../components/Grid/Grid';
import TextInput from '../forms/TextInput/TextInput';
import './ItemChooser.scss';
import Button from '../Button/Button';
import EditIcon from '../../icons/EditIcon';

/**
 * Presents a search box and a customized ag-grid table.  The search
 * box feeds the ag-grids quickFilterText properties to quickly search
 * the ag-grid contents
 * @param props
 * @returns
 */
function ItemChooser(props: ChooserProps) {
  const [filterState, setFilterState] = React.useState('');

  return (
    <div className={`item-chooser${props.className ? ' ' + props.className : ''}`}>
      <div className='item-chooser__actions'>
        <TextInput id='chooser-filter' name='chooserFilter' type='search'
          data-testid='chooser-filter'
          placeholder='Search'
          defaultValue={filterState}
          onChange={(event) => setFilterState(event.target.value)}
          className='actions__input'
        />

        {props.showEditBtn &&
          <Button className='actions__edit-btn' disableMobileFullWidth type={'button'} onClick={props.onEditBtnClick} disabled={props.disableEditBtn} unstyled>
            <EditIcon disabled={props.disableEditBtn} size={1.25} />
          </Button>
        }
      </div>

      <Grid
        quickFilterText={filterState}
        height='300px'
        data={props.items || []}
        columns={props.columns}
        rowClass='ag-grid--row-pointer'
        rowSelection={props.rowSelection ?? 'single'}
        onRowClicked={props.onRowClicked}
        hardRefresh={props.hardRefresh}
        className='item-chooser__grid'
        suppressRowClickSelection={props.suppressRowClickSelection}
        onRowSelected={props.onRowSelected}
        onGridReady={props.onGridReady}
      />
    </div>
  )

}

export default ItemChooser;
