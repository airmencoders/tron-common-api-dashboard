import React from 'react';
import { ChooserProps } from './ChooserProps';
import Grid from '../../components/Grid/Grid';
import TextInput from '../forms/TextInput/TextInput';

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
        <>
            <TextInput id='chooser-filter' name='chooserFilter' type='search'
              data-testid='chooser-filter'
              placeholder='Search'
              defaultValue={filterState}
              onChange={(event) => setFilterState(event.target.value)}
            />
            <Grid
                quickFilterText={filterState}
                height='300px'
                data={props.items || []}
                columns={props.columns}
                rowClass='ag-grid--row-pointer'
                rowSelection='single'
                onRowClicked={props.onRowClicked}
                hardRefresh={props.hardRefresh}
            />
        </>
    )

}

export default ItemChooser;
    