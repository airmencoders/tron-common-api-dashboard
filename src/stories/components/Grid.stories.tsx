import React from 'react';

import {Story, Meta} from '@storybook/react/types-6-0';
import Grid from '../../components/Grid/Grid';
import {GridProps} from '../../components/Grid/GridProps';
import GridColumn from '../../components/Grid/GridColumn';

export default {
  title: 'Grid Component',
  component: Grid
} as Meta;

const Template: Story<GridProps> = (args) => (
    <div style={{height: '80vh'}}>
      <Grid {...args} />
    </div>
    );

export const Default = Template.bind({});
Default.args = {
  columns: [
    new GridColumn({
      field: 'col1',
      sortable: true,
      headerName: 'Column 1'
    }),
    new GridColumn({
      field: 'col2',
      filter: true,
      headerName: 'Column 2'
    }),
  ],
  data: [
    { col1: 'Value 1', col2: 1 },
    { col1: 'Value 2', col2: 2 }
  ]
};
