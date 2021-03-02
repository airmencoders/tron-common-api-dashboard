import React from 'react';
import Select from '../../components/forms/Select/Select';
import {SelectProps} from '../../components/forms/Select/SelectProps';
import {Meta, Story} from '@storybook/react';
import Form from '../../components/forms/Form/Form';
import '../../App.scss';

export default {
  title: 'Components/Select',
  component: Select
} as Meta;

const Template: Story<SelectProps> = (args) => (
    <Form onSubmit={()=>{}}>
      <Select {...args}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </Select>
    </Form>
);

export const Default = Template.bind({});
Default.args = {
  id: 'testSelect'
}
