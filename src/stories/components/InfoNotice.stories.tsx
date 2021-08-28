import React from 'react';
import InfoNotice from '../../components/InfoNotice/InfoNotice';
import {Meta} from '@storybook/react/types-6-0';
import {InfoNoticeProps} from '../../components/InfoNotice/InfoNoticeProps';
import {Story} from '@storybook/react';

export default {
  title: 'Components/InfoNotice',
  component: InfoNotice
} as Meta;

const Template: Story<InfoNoticeProps> = (args) => <InfoNotice {...args}>This is child content</InfoNotice>;

export const Default = Template.bind({});
Default.args = {
  type: 'info'
};
