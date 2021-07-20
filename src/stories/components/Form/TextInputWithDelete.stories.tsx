import React from 'react';

import { Story, Meta } from '@storybook/react/types-6-0';
import TextInputWithDelete from '../../../components/forms/TextInputWithDelete/TextInputWithDelete';
import { TextInputWithDeleteProps } from '../../../components/forms/TextInputWithDelete/TextInputWithDeleteProps';
import { TextInputProps } from '../../../components/forms/TextInput/TextInputProps';
import Form from '../../../components/forms/Form/Form';

export default {
  title: 'Components/Form/TextInputWithDelete',
  component: TextInputWithDelete
} as Meta;

const Template: Story<TextInputWithDeleteProps & TextInputProps> = (args) => <Form onSubmit={() => { return }}><TextInputWithDelete {...args} /></Form>;

export const Default = Template.bind({});
Default.args = {
  type: 'text',
  value: 'Test',
  onDeleteClickHandler: () => { alert('Clicked delete') },
  withDelete: true
};

export const Disabled = Template.bind({});
Disabled.args = {
  type: 'text',
  disabled: true,
  value: 'Test',
  withDelete: true
};
