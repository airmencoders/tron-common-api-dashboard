import React from 'react';
import {Meta, Story} from '@storybook/react/types-6-0';
import StatusCard from '../../components/StatusCard/StatusCard';
import {StatusCardProps} from '../../components/StatusCard/StatusCardProps';
import {StatusType} from '../../components/StatusCard/status-type';


export default {
  title: 'Components/StatusCard',
  component: StatusCard
} as Meta;

const Template: Story<StatusCardProps> = (args) => <StatusCard {...args} />;

export const GoodStatus = Template.bind({});
GoodStatus.args = {
  status: StatusType.GOOD,
  title: 'Status Good'
};


export const BadStatus = Template.bind({});
BadStatus.args = {
  status: StatusType.ERROR,
  title: 'Status Error'
};
