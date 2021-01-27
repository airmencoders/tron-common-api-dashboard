import React from 'react';
import {Meta, Story} from '@storybook/react/types-6-0';
import Modal from '../../components/Modal/Modal';
import {ModalProps} from '../../components/Modal/ModalProps';
import ModalTitle from '../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';


export default {
  title: 'Modal Component',
  component: Modal
} as Meta;

const Template: Story<ModalProps> = (args) => (
    <div>
      <Modal {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
  headerComponent:(<div>header</div>),
  children: (<div>Body of modal</div>),
  footerComponent: (<div>footer</div>),
  show: true
};

export const DefaultTile = Template.bind({});
DefaultTile.args = {
  headerComponent:(<ModalTitle title="Title to Show" />),
  children: (<div>Body of modal</div>),
  footerComponent: (<div>footer</div>),
  show: true
};

export const WithSubmit = Template.bind({});
WithSubmit.args = {
  headerComponent:(<ModalTitle title="Title to Show" />),
  children: (<div>Body of modal</div>),
  footerComponent: (<ModalFooterSubmit onSubmit={() => {}}
                                       onCancel={() => {}} />),
  show: true
};
