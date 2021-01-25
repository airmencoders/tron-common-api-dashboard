import React from 'react';

import {Story, Meta} from '@storybook/react/types-6-0';
import PageFormat, {PageFormatProps} from '../../components/PageFormat/PageFormat';

export default {
  title: 'Page Format',
  component: PageFormat
} as Meta;

const Template: Story<PageFormatProps> = (args) => (
    <PageFormat {...args}>
      <div>This is the page content.</div>
    </PageFormat>);

export const Default = Template.bind({});
Default.args = {
  pageTitle: "Page Title"
};
