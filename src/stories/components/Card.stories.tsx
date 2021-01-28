import React from 'react';

import {Story, Meta} from '@storybook/react/types-6-0';
import Card from '../../components/Card/Card';
import {CardProps} from '../../components/Card/CardProps';

export default {
  title: 'Components/Card',
  component: Card
} as Meta;

const Template: Story<CardProps> = (args) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (<div>Card Content</div>)
};
