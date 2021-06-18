import React from 'react';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuditLogDetailsForm from '../AuditLogDetailsPage';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { AppSourceDetailsDto, HttpLogEntryDetailsDto } from '../../../openapi';
import { validationErrors } from '../../../utils/validation-utils';

describe('Test Audit Log Details', () => {  

  it('Loads/Displays OK', async () => {
    
    const onSubmit = () => {}
    const onClose = () => {}

    const data : HttpLogEntryDetailsDto = {

    }

    const page = render(
      <MemoryRouter>
        <AuditLogDetailsForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={{
            success: false,
            successMsg: ''
          }}
          data={data}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(page.getByTestId('audit-log-details-dismiss')).toBeInTheDocument());
  })

});
