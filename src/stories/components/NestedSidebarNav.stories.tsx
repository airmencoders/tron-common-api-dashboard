import React, {useEffect, useState} from 'react';

import {Story, Meta} from '@storybook/react/types-6-0';
import { MemoryRouter } from 'react-router-dom';
import NestedSidebarNav from '../../components/NestedSidebarNav/NestedSidebarNav';
import SidebarItem from '../../components/Sidebar/SidebarItem';

const StoryComponent = () => {
  const [openParentNav, setOpenParentNav] = useState<string>('');
  return (
      <MemoryRouter initialEntries={['/path-1']}>
        <div className="test-container"
             style={{
               height: '650px',
               width: '300px',
               backgroundColor: 'black'
             }}
        >
          <NestedSidebarNav id="test"
                            title="Test"
                            onToggleClicked={(id) => {
                              if (id === openParentNav) {
                                setOpenParentNav('');
                              }
                              else {
                                setOpenParentNav(id)
                              }
                            }}
                            isOpened={openParentNav === 'test'}
          >
            <SidebarItem path="/path-1" name="Link 1"/>
            <SidebarItem path="/path-2" name="Link 2"/>
          </NestedSidebarNav>
        </div>
      </MemoryRouter>
  )
}

export default {
  title: 'Components/NestedSidebarNav',
  component: StoryComponent
} as Meta;

const Template: Story<any> = () => <StoryComponent />;

export const Default = Template.bind({});
Default.args = {
};
