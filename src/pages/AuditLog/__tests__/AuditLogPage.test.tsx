import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HttpLogEntryDto, HttpLogsControllerApi } from '../../../openapi';
import AuditLogService from '../../../state/audit-log/audit-log-service';
import { SearchLogParams, useAuditLogState } from '../../../state/audit-log/audit-log-state';
import AuditLogPage from '../AuditLogPage';

jest.mock('../../../state/audit-log/audit-log-state');

describe('Test Audit Log Page', () => {
  let auditLogState: State<HttpLogEntryDto[]> & StateMethodsDestroy;
  let searchParamLogState: State<SearchLogParams> & StateMethodsDestroy;
  let auditLogSourceApi: HttpLogsControllerApi;

  beforeEach(() => {
    auditLogState = createState<HttpLogEntryDto[]>(new Array<HttpLogEntryDto>());
    auditLogSourceApi = new HttpLogsControllerApi();
  });

  it('Test Loading Page', async () => {
    function mockAuditSourceState() {
      (useAuditLogState as jest.Mock).mockReturnValue(new AuditLogService(auditLogState, searchParamLogState, auditLogSourceApi));

      jest.spyOn(useAuditLogState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockAuditSourceState();

    const page = render(
      <MemoryRouter>
        <AuditLogPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(page.getByTestId('search-form-container')).toBeInTheDocument());
  });
})
