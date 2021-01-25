import React from 'react';

import { Story, Meta } from '@storybook/react/types-6-0';
import {ButtonProps} from '../../components/Button/ButtonProps';
import Button from '../../components/Button/Button';

export default {
  title: 'Components/Button',
  component: Button
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args}>Button</Button>;

export const Default = Template.bind({});
Default.args = {
  type: 'button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  type: 'button',
  secondary: true
};

export const Disabled = Template.bind({});
Disabled.args = {
  type: 'button',
  disabled: true
};
