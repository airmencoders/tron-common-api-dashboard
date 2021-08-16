import { format } from 'date-fns';
import React, { ChangeEvent } from 'react';
import Button from '../../components/Button/Button';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import GridColumn from '../../components/Grid/GridColumn';
import { HttpLogEntryDetailsDto, HttpLogEntryDto } from '../../openapi/models';
import { useAuditLogState } from '../../state/audit-log/audit-log-state';
import { getDefaultSearchLogParams, SearchLogParams } from '../../state/audit-log/search-log-params';
import './AuditLogDetailsForm.scss';
import AuditLogDetailsPage from './AuditLogDetailsPage';

const columns: GridColumn[] =
  [
    new GridColumn({
      field: 'requestTimestamp',
      headerName: 'Timestamp (UTC)',
      resizable: true,
      initialWidth: 100,
    }),
    new GridColumn({
      field: 'requestMethod',
      headerName: 'Method',
      resizable: true,
      initialWidth: 30,
    }),
    new GridColumn({
      field: 'requestedUrl',
      headerName: 'Requested Url',
      initialWidth: 100,
      showTooltip: true,
      resizable: true,
    }),
    new GridColumn({
      field: 'statusCode',
      headerName: 'Status',
      resizable: true,
      initialWidth: 30,
    }),
    new GridColumn({
      field: 'userAgent',
      headerName: 'User Agent',
      showTooltip: true,
      resizable: true,
      initialWidth: 50,
    }),
    new GridColumn({
      field: 'requestHost',
      headerName: 'Host',
      resizable: true,
      initialWidth: 50,
    }),
    new GridColumn({
      field: 'remoteIp',
      headerName: 'Remote IP',
      resizable: true,
      initialWidth: 50,
    }),
    new GridColumn({
      field: 'userName',
      headerName: 'User / App',
      resizable: true,
      initialWidth: 50,
    }),
    new GridColumn({
      field: 'timeTakenMs',
      headerName: 'Time Taken (ms)',
      resizable: true,
      initialWidth: 30,
    }),
  ];

function AuditLogPage() {
  const initState: SearchLogParams = getDefaultSearchLogParams();

  const [dateError, setDateError ] = React.useState(false);  // malformed date indicator
  const [searchState, setSearchState] = React.useState<SearchLogParams>(initState);  // local form state
  const [refreshGrid, setRefreshGrid] = React.useState(false);
  const [scrollToTop, setScrollToTop] = React.useState(false);
  const httpLogsState = useAuditLogState();

  const setNewFromDate = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && event.target.value.match(/\d\d\d\d-\d\d-\d\d/)) {
      setSearchState({...searchState, date: event.target.value});
      setDateError(false);
    }
    else {
      setDateError(true);
    }
  }

  const resetSearch = () => {
    setSearchState(initState);
    httpLogsState.searchParamsState.merge(initState);
    updateGrid();
  }

  const refreshSearch = () => {
    httpLogsState.searchParamsState.merge(searchState);
    updateGrid();
  }

  const updateGrid = () => {
    setRefreshGrid(true);
    setScrollToTop(true);
  }

  // helper to build out the search form
  const searchForm = () => {
    return (
      <>
      <div>
        <FormGroup labelName="search-form-requestTimestamp"
          labelText="From Date (UTC)"
          errorMessages={[ 'Please enter a valid date' ]}
          isError={dateError}
          >
            <input
              id='search-form-requestTimestamp'
              aria-label='search-form-requestTimestamp'
              name='audit-log-from-date'
              type='date'
              value={searchState.date
                  || format(new Date(), 'yyyy-MM-dd')}
              onChange={setNewFromDate}
            />
        </FormGroup>
        <hr/>
      </div>
      <div data-testid='search-form-container' id='search-form-container' style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
      }}>
        <div>
          <FormGroup labelName="search-form-requestMethod"
            labelText="HTTP Method"
            >
              <TextInput
                id="search-form-requestMethod"
                aria-label="search-form-requestMethod"
                name="audit-log-requestMethod"
                type="search"
                value={searchState.requestMethod}
                onChange={(event) => setSearchState({...searchState, requestMethod: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-requestedUrl"
            labelText="Url Contains"
            >
              <TextInput
                id="search-form-requestedUrl"
                aria-label="search-form-requestedUrl"
                name="audit-log-requestedUrl"
                type="search"
                value={searchState.requestedUrlContains}
                onChange={(event) => setSearchState({...searchState, requestedUrlContains: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-statusCode"
            labelText="Status Code"
            >
              <TextInput
                id="search-form-statusCode"
                aria-label="search-form-statusCode"
                name="audit-log-statusCode"
                type="search"
                value={searchState.statusCode}
                onChange={(event) => setSearchState({...searchState, statusCode: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-remoteIp"
            labelText="Remote IP Contains"
            >
              <TextInput
                id="search-form-remoteIp"
                name="audit-log-remoteIp"
                value={searchState.remoteIpContains}
                type="search"
                onChange={(event) => setSearchState({...searchState, remoteIpContains: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-requestHost"
            labelText="Host Contains"
            >
              <TextInput
                id="search-form-requestHost"
                name="audit-log-requestHost"
                value={searchState.hostContains}
                type="search"
                onChange={(event) => setSearchState({...searchState, hostContains: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-userAgent"
            labelText="User Agent Contains"
            >
              <TextInput
                id="search-form-userAgent"
                name="audit-log-userAgent"
                value={searchState.userAgentContains}
                type="search"
                onChange={(event) => setSearchState({...searchState, userAgentContains: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-queryString"
            labelText="Query String Contains"
            >
              <TextInput
                id="search-form-queryString"
                name="audit-log-queryString"
                value={searchState.queryStringContains}
                type="search"
                onChange={(event) => setSearchState({...searchState, queryStringContains: event.target.value})}
              />
          </FormGroup>
        </div>
        <div style={{marginLeft: '5px'}}>
          <FormGroup labelName="search-form-requester"
            labelText="Username Contains"
            >
              <TextInput
                id="search-form-requester"
                name="audit-log-requester"
                value={searchState.userNameContains}
                type="search"
                onChange={(event) => setSearchState({...searchState, userNameContains: event.target.value})}
              />
          </FormGroup>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <div className="search-actions button-container">
          <Button
            type="button"
            className="no-bg-button"
            unstyled
            onClick={() => resetSearch()}>
              Reset Search
          </Button>
          <Button
            className="button-container__search"
            type="button"
            disabled={dateError}
            onClick={() => refreshSearch()}>
              Search
          </Button>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
    <DataCrudFormPage<HttpLogEntryDto, HttpLogEntryDetailsDto>
      columns={columns}
      dataTypeName="Log Entry Details"
      pageTitle="Audit Logs"
      useDataState={() => httpLogsState}
      allowAdd={false}
      allowEdit={true}
      updateForm={AuditLogDetailsPage}
      allowDelete={false}
      autoResizeColumns
      autoResizeColummnsMinWidth={1200}
      beforeChildren={searchForm()}
      infiniteScrollOptions={{enabled: true}}
      refreshState={refreshGrid}
      refreshStateCallback={() => setRefreshGrid(false)}
      scrollToTop={scrollToTop}
      scrollToTopCallback={() => setScrollToTop(false)}
    />
    </>
  );
}

export default AuditLogPage;
