import { render, screen } from '@testing-library/react';
import React from 'react';
import { PersonControl } from './PersonControl';
import { PersonContext } from '../../context/PersonProviderContext';
import { v4 as uuidv4 } from 'uuid';
import { MemoryRouter } from 'react-router-dom';


describe("<PersonControl> Tests", () => {

  it("Should load/render ok", () => {
    let obj = {
      users: [{
        id: uuidv4(),
        firstName: 'Chris',
        lastName: 'Zell',
        title: 'Maj',
        email: 'cz@test.com',
      }]
    };

    render(
      <MemoryRouter>
        <PersonContext.Provider value={obj}>
          <PersonControl />
        </PersonContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByTestId(obj.users[0].id)).toBeInTheDocument();
    expect(screen.queryByText("New Person")).toBeNull();
  });


});