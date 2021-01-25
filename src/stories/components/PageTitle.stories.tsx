import React from 'react';

import { Story, Meta } from '@storybook/react/types-6-0';
import PageTitle, {PageTitleProps} from '../../components/PageTitle/PageTitle';

export default {
  title: 'Components/Page Title',
  component: PageTitle
} as Meta;

const Template: Story<PageTitleProps> = (args) => <PageTitle {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'This Page Title'
};
