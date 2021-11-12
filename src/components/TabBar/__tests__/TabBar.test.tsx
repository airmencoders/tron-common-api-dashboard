import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import TabBar from '../TabBar';


describe('Tab Bar Tests', () => {

  it('should render tabs', async() => {
    function WrapperComp() {
      const [tab, setTab] = React.useState(0);
      return (
        <TabBar
          selectedIndex={tab}
          items={[
            { onClick: () => setTab(0), content: <h1>Tab1</h1>, text: "tab1" },
            { onClick: () => setTab(1), content: <h1>Tab2</h1>, text: "tab2" },
          ]} />
      )
    }   
    const page = render(<WrapperComp />);

    await waitFor(() => expect(page.getByText('Tab1')).toBeVisible());
    await waitFor(() => expect(page.queryByText('Tab2')).toBeFalsy());

    fireEvent.click(page.getByText('tab2'));      

    await waitFor(() => expect(page.queryByText('Tab1')).toBeFalsy());
    await waitFor(() => expect(page.queryByText('Tab2')).toBeVisible());
  });
});