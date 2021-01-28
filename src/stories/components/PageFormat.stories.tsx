import React from 'react';

import {Story, Meta} from '@storybook/react/types-6-0';
import PageFormat, {PageFormatProps} from '../../components/PageFormat/PageFormat';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Page Format',
  component: PageFormat
} as Meta;

const Template: Story<PageFormatProps> = (args) => (
  <MemoryRouter>
      <PageFormat {...args}>
        <div>This is the page content.</div>
    </PageFormat>
  </MemoryRouter>);

export const Default = Template.bind({});
Default.args = {
  pageTitle: "Page Title"
};
