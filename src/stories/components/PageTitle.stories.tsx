import React from 'react';

import { Story, Meta } from '@storybook/react/types-6-0';
import PageTitle from '../../components/PageTitle/PageTitle';
import {PageTitleProps} from '../../components/PageTitle/PageTitleProps';

export default {
  title: 'Components/Page Title',
  component: PageTitle
} as Meta;

const Template: Story<PageTitleProps> = (args) => <PageTitle {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'This Page Title'
};
