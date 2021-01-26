import React from 'react';
import { render } from '@testing-library/react';
import { HealthPage } from '../HealthPage';

describe('Health Page', () => {
    it('Test Health Page', async () => {
        const page = render(
            <HealthPage />,
        );

        expect(page.getByText(/Loading/i)).toBeDefined();
    });
});
