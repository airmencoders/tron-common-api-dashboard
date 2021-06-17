import { render } from '@testing-library/react';
import React from 'react';
import { PersonDto } from '../../../openapi';
import PersonDelete from '../PersonDelete';

describe('Test Person Delete Component', () => {
    let onSubmit = jest.fn();
    let onClose = jest.fn();
    let data: PersonDto;

    beforeEach(() => {
        onSubmit = jest.fn().mockImplementation(() => {

        });

        onClose = jest.fn().mockImplementation(() => {

        });

        data = {
            id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
            email: "john@test.com"
        }
    });

    it('Renders', () => {
        const pageRender = render(
            <PersonDelete
                data={data}
                dataTypeName="Person"
            />
        );

        expect(pageRender.getByTestId('data-crud-delete-content')).toBeInTheDocument();
        expect(pageRender.getByText(data.id!)).toBeInTheDocument();
        expect(pageRender.getByText(data.email!)).toBeInTheDocument();
    });
})
