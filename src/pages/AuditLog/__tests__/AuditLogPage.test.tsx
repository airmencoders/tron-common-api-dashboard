import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor, fireEvent } from '@testing-library/react';
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

  it('should show the text inputs', async () => {
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

    await waitFor(() => expect(page.getByLabelText('HTTP Method')).toBeInTheDocument());
    await waitFor(() => expect(page.getByLabelText('Url Contains')).toBeInTheDocument());
    await waitFor(() => expect(page.getByLabelText('Status Code')).toBeInTheDocument());
    await waitFor(() => expect(page.getByLabelText('Remote IP Contains')).toBeInTheDocument());
    await waitFor(() => expect(page.getByLabelText('Host Contains')).toBeInTheDocument());
    await waitFor(() => expect(page.getByLabelText('User Agent Contains')).toBeInTheDocument());
  });

  it ('should change input values', async () => {
    function mockAuditSourceState() {
      (useAuditLogState as jest.Mock).mockReturnValue(new AuditLogService(auditLogState, searchParamLogState, auditLogSourceApi));

      jest.spyOn(useAuditLogState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockAuditSourceState();

    const page = render(
        <MemoryRouter>
          <AuditLogPage/>
        </MemoryRouter>
    );

    await waitFor(() => {
      const textInput = page.getByLabelText('search-form-requestMethod') as HTMLInputElement;
      fireEvent.change(textInput, {target: {value: 'GET'}});
      expect(textInput.value).toBe('GET');

      const urlTextInput = page.getByLabelText('search-form-requestedUrl') as HTMLInputElement;
      fireEvent.change(urlTextInput, {target: {value: '/endpoint'}});
      expect(urlTextInput.value).toBe('/endpoint');

      const statusCodeInput = page.getByLabelText('search-form-statusCode') as HTMLInputElement;
      fireEvent.change(statusCodeInput, {target: {value: '200'}});
      expect(statusCodeInput.value).toBe('200');
    });

  });

  it ('should error for incorrect date format', async () => {
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

    await waitFor(() => {
      const textInput = page.getByLabelText('search-form-requestTimestamp') as HTMLInputElement;
      fireEvent.change(textInput, { target: { value: '555'}});
      expect(page.getByText('Please enter a valid date')).toBeTruthy();
    });
  });

  it ('should not show error for correct date format', async () => {
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

    await waitFor(() => {
      const textInput = page.getByLabelText('search-form-requestTimestamp') as HTMLInputElement;
      fireEvent.change(textInput, { target: { value: '2021-01-01'}});
      expect(page.queryByText('Please enter a valid date')).not.toBeInTheDocument();
    });
  });
})
