import React from 'react';
import { render } from '@testing-library/react';
import { HealthPage } from '../HealthPage';
import { MemoryRouter } from 'react-router-dom';

it('Test Health Page', async () => {
    const page = render(
        <MemoryRouter>
            <HealthPage />,
        </MemoryRouter>
    );

    expect(page.getByText(/Loading/i)).toBeDefined();
});
