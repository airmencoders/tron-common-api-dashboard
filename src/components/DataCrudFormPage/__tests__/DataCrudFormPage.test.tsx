import React from 'react';
import DataCrudDeleteContent from '../DataCrudDeleteContent';
import { render, waitFor, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import {DataCrudFormPage} from '../DataCrudFormPage';
import {DataService} from '../../../state/data-service/data-service';
import { createState, none, State, StateMethodsDestroy, useState } from '@hookstate/core';
import GridColumn from '../../Grid/GridColumn';
import {MemoryRouter} from 'react-router-dom';
import { DataCrudDeleteComponentProps } from '../../DataCrudFormPage/DataCrudDeleteComponentProps';
import { ToastContainer } from '../../Toast/ToastContainer/ToastContainer';
import { PatchResponse } from '../../../state/data-service/patch-response';
import { ResponseType } from '../../../state/data-service/response-type';
import { FilterDto } from '../../../openapi';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import axios from 'axios';
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';

interface TestRow {
  id: string;
  val: string;
}

interface TestDto {
  id: string;
  val: string;
}

class TestDataService implements DataService<TestRow, TestDto> {
  isPromised = false;
  error = undefined;

  constructor(public state: State<TestRow[]>) { }

  fetchAndStoreData(): CancellableDataRequest<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0'},
      { id: '1', val: 'val1'},
    ];
    this.state.set(initData);

    const axiosResponse = createAxiosSuccessResponse(initData);
    return {
      promise: Promise.resolve(axiosResponse.data),
      cancelTokenSource: axios.CancelToken.source()
    };
  }

  fetchAndStorePaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0' },
      { id: '1', val: 'val1' },
    ];
    this.state.set(initData);
    return Promise.resolve(initData);
  }

  sendUpdate(toUpdate: TestDto): Promise<TestRow> {
    this.state.set(current => {
      const updated = [...current];
      const indexToUpdate = updated.findIndex(row => row.id === toUpdate.id);
      updated[indexToUpdate].val = toUpdate.val;
      return updated;
    });
    return Promise.resolve(toUpdate);
  }

  sendCreate(toCreate: TestDto): Promise<TestRow> {
    this.state.set(current => ([
        ...current,
        toCreate
    ]));
    return Promise.resolve(toCreate);
  }

  sendDelete(toDelete: TestDto): Promise<void> {
    const indexToUpdate = this.state.get().findIndex(item => item.id === toDelete.id);
    this.state[indexToUpdate].set(none);

    return Promise.resolve();
  }

  sendPatch(params: any): Promise<PatchResponse<TestRow>> {
    return Promise.resolve({
      type: ResponseType.SUCCESS,
      data: { id: '0', val: 'val0' }
    });
  }

  convertRowDataToEditableData(rowData: TestRow): Promise<TestDto> {
    const values = this.state.get();
    const foundData = values.find(row => row.id === rowData.id);
    if (foundData == null) {
      return Promise.reject();
    }
    return Promise.resolve(foundData);
  }

  resetState(): void {
    return;
  }
}

class TestDataErrorService implements DataService<TestRow, TestDto> {
  isPromised = false;
  error = 'error';

  constructor(public state: State<TestRow[]>) { }

  fetchAndStoreData(): CancellableDataRequest<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0'},
      { id: '1', val: 'val1'},
    ];
    this.state.set(initData);

    const axiosResponse = createAxiosSuccessResponse(initData);
    return {
      promise: Promise.resolve(axiosResponse.data),
      cancelTokenSource: axios.CancelToken.source()
    };
  }

  sendUpdate(toUpdate: TestDto): Promise<TestRow> {
    this.state.set(current => {
      const updated = [...current];
      const indexToUpdate = updated.findIndex(row => row.id === toUpdate.id);
      updated[indexToUpdate].val = toUpdate.val;
      return updated;
    });
    return Promise.resolve(toUpdate);
  }

  sendCreate(toCreate: TestDto): Promise<TestRow> {
    this.state.set(current => ([
      ...current,
      toCreate
    ]));
    return Promise.resolve(toCreate);
  }

  sendDelete(toDelete: TestDto): Promise<void> {
    const indexToUpdate = this.state.get().findIndex(item => item.id === toDelete.id);
    this.state[indexToUpdate].set(none);

    return Promise.resolve();
  }

  convertRowDataToEditableData(rowData: TestRow): Promise<TestDto> {
    const values = this.state.get();
    const foundData = values.find(row => row.id === rowData.id);
    if (foundData == null) {
      return Promise.reject();
    }
    return Promise.resolve(foundData);
  }

  resetState(): void {
    return;
  }
}

class TestDataRequestErrorService implements DataService<TestRow, TestDto> {
  isPromised = false;
  error = undefined;

  private errorMsg = 'ERROR';

  constructor(public state: State<TestRow[]>) { }

  fetchAndStoreData(): CancellableDataRequest<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0' },
      { id: '1', val: 'val1' },
    ];
    this.state.set(initData);

    const axiosResponse = createAxiosSuccessResponse(initData);
    return {
      promise: Promise.resolve(axiosResponse.data),
      cancelTokenSource: axios.CancelToken.source()
    };
  }

  sendUpdate(toUpdate: TestDto): Promise<TestRow> {
    throw new Error(this.errorMsg);
  }

  sendCreate(toCreate: TestDto): Promise<TestRow> {
    throw new Error(this.errorMsg);
  }

  sendDelete(toDelete: TestDto): Promise<void> {
    throw new Error(this.errorMsg);
  }

  sendPatch(params: any): Promise<PatchResponse<TestRow>> {
    return Promise.reject({
      type: ResponseType.FAIL,
      errors: [new Error(this.errorMsg)]
    });
  }

  onPatch(params: any): Promise<TestRow> {
    throw new Error(this.errorMsg);
  }

  convertRowDataToEditableData(rowData: TestRow): Promise<TestDto> {
    const values = this.state.get();
    const foundData = values.find(row => row.id === rowData.id);
    if (foundData == null) {
      return Promise.reject();
    }
    return Promise.resolve(foundData);
  }

  resetState(): void {
    return;
  }
}

const CreateUpdateTestForm = ({ onSubmit, successAction, formErrors, onPatch }: any) => {
  return (
    <div data-testid="form">
      <div>Form</div>
      <div>{formErrors?.general ? 'Error' : 'No Error'}</div>
      <div>{successAction?.successMsg ? 'Successfully' : 'Not Submit'}</div>
      <button onClick={() => onSubmit({id: '0', val: 'val01'})}>Submit</button>
      <button onClick={() => onPatch()}>Patch</button>
    </div>
  )
}

const DeleteComponent = (props: DataCrudDeleteComponentProps<TestRow>) => {
  return (
    <DataCrudDeleteContent
      dataTypeName={props.dataTypeName}
    />
  );
}

const updateToastMsg = /Successfully updated/i;
const createToastMsg = /Successfully created/i;
const deleteToastMsg = /Successfully deleted/i;

describe('Test DataCrudFormPage', () => {
  let testState: State<TestRow[]> & StateMethodsDestroy;
  let useTestState: () => State<TestRow[]>;
  let wrappedState: () => TestDataService;
  let wrappedErrorState: () => TestDataErrorService;
  let wrappedRequestErrorState: () => TestDataRequestErrorService;

  beforeEach(() => {
    testState = createState(new Array<TestRow>());
    useTestState = () => useState(testState);
    wrappedState = () => new TestDataService(useTestState());
    wrappedErrorState = () => new TestDataErrorService(useTestState());
    wrappedRequestErrorState = () => new TestDataRequestErrorService(useTestState());
  });

  afterEach(() => {
    testState.destroy();
  })

  it('should render', async () => {
    render(
        <MemoryRouter>
          <DataCrudFormPage<TestRow, TestDto>
              useDataState={wrappedState}
              columns={[
                new GridColumn({
                  field: 'id',
                  headerName: 'id'
                }),
                new GridColumn({
                  field: 'val',
                  headerName: 'val'
                }),
              ]}
              createForm={CreateUpdateTestForm}
              updateForm={CreateUpdateTestForm}
              pageTitle="Test Page Title"
              dataTypeName="Test"
              allowEdit={true} />
        </MemoryRouter>
    );

    await waitFor(
        () => expect(screen.getAllByText('Test Page Title')).toBeTruthy()
    );
    const tableVal = await screen.findByText('val0');
    expect(tableVal).toBeTruthy();
  });

  it('should show sidebar if page in add state', async () => {
    render(
        <MemoryRouter>
          <DataCrudFormPage<TestRow, TestDto>
              useDataState={wrappedState}
              columns={[
                new GridColumn({
                  field: 'id',
                  headerName: 'id'
                }),
                new GridColumn({
                  field: 'val',
                  headerName: 'val'
                }),
              ]}
              createForm={CreateUpdateTestForm}
              updateForm={CreateUpdateTestForm}
              pageTitle="Test Page Title"
              dataTypeName="Test"
          allowEdit={true}
          allowAdd
        />
        </MemoryRouter>
    );

    await screen.findByText('Add Test');
    fireEvent.click(screen.getByText('Add Test'));
    const formLabel = await screen.findByText('Form');
    expect(formLabel).toBeTruthy();
  });

  it('should open the update panel if row clicked', async () => {
    render(
        <MemoryRouter>
          <DataCrudFormPage<TestRow, TestDto>
              useDataState={wrappedState}
              columns={[
                new GridColumn({
                  field: 'id',
                  headerName: 'id'
                }),
                new GridColumn({
                  field: 'val',
                  headerName: 'val'
                }),
              ]}
              createForm={CreateUpdateTestForm}
              updateForm={CreateUpdateTestForm}
              pageTitle="Test Page Title"
              dataTypeName="Test"
              allowEdit={true} />
        </MemoryRouter>
    );

    await screen.findByText('val0');
    fireEvent.click(screen.getByText('val0'));
    const formLabel = await screen.findByText('Form');
    expect(formLabel).toBeTruthy();
  });

  it('should show error state if request error', async () => {
    render(
        <MemoryRouter>
          <DataCrudFormPage<TestRow, TestDto>
              useDataState={wrappedErrorState}
              columns={[
                new GridColumn({
                  field: 'id',
                  headerName: 'id'
                }),
                new GridColumn({
                  field: 'val',
                  headerName: 'val'
                }),
              ]}
              createForm={CreateUpdateTestForm}
              updateForm={CreateUpdateTestForm}
              pageTitle="Test Page Title"
              dataTypeName="Test"
              allowEdit={true} />
        </MemoryRouter>
    );

    const error = await screen.findByText('error');
    expect(error).toBeTruthy();
  });

  it('should show success message for successful update', async () => {
    render(
        <MemoryRouter>
        <ToastContainer />
          <DataCrudFormPage<TestRow, TestDto>
              useDataState={wrappedState}
              columns={[
                new GridColumn({
                  field: 'id',
                  headerName: 'id'
                }),
                new GridColumn({
                  field: 'val',
                  headerName: 'val'
                }),
              ]}
              createForm={CreateUpdateTestForm}
              updateForm={CreateUpdateTestForm}
              pageTitle="Test Page Title"
              dataTypeName="Test"
              allowEdit={true} />
        </MemoryRouter>
    );

    await screen.findByText('val0');
    fireEvent.click(screen.getByText('val0'));
    await screen.findByText('Submit');
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(
      () => expect(screen.getByText(updateToastMsg)).toBeTruthy(),
    )
  });

  it('should show success message for successful create', async () => {
    render(
        <MemoryRouter>
        <ToastContainer />
          <DataCrudFormPage<TestRow, TestDto>
            useDataState={wrappedState}
            columns={[
              new GridColumn({
                field: 'id',
                headerName: 'id'
              }),
              new GridColumn({
                field: 'val',
                headerName: 'val'
              }),
            ]}
            createForm={CreateUpdateTestForm}
            updateForm={CreateUpdateTestForm}
            pageTitle="Test Page Title"
            dataTypeName="Test"
            allowEdit={true}
            allowAdd
          />
        </MemoryRouter>
    );

    await screen.findByText('Add Test');
    fireEvent.click(screen.getByText('Add Test'));
    await screen.findByText('Submit');
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(
      () => expect(screen.getByText(createToastMsg)).toBeTruthy(),
    )
  });

  it('should show success message for successful patch', async () => {
    render(
      <MemoryRouter>
        <ToastContainer />
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
        />
      </MemoryRouter>
    );

    const rowItem = await screen.findByText('val0');
    fireEvent.click(rowItem);
    const patchBtn = await screen.findByText('Patch');
    fireEvent.click(patchBtn);

    await expect(screen.findByText(updateToastMsg)).resolves.toBeInTheDocument();
  });

  it('should close sidedrawer when close button clicked', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true} />
      </MemoryRouter>
    );

    const rowItem = await screen.findByText('val0');
    fireEvent.click(rowItem);

    const closeBtn = (await screen.findByTitle('close')).closest('button');
    expect(closeBtn).toBeDefined();
    if (closeBtn) fireEvent.click(closeBtn);
  });

  it('createSubmit error', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedRequestErrorState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          deleteComponent={DeleteComponent}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
          allowDelete
        />
      </MemoryRouter>
    );

    const addBtn = await screen.findByText('Add Test');
    fireEvent.click(addBtn);
    const submitBtn = await screen.findByText('Submit');
    fireEvent.click(submitBtn);

    await expect(screen.findByText('Error')).resolves.toBeInTheDocument();
  });

  it('updateSubmit error', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedRequestErrorState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          deleteComponent={DeleteComponent}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
          allowDelete
        />
      </MemoryRouter>
    );

    const rowItem = await screen.findByText('val0');
    fireEvent.click(rowItem);
    const submitBtn = await screen.findByText('Submit');
    fireEvent.click(submitBtn);

    await expect(screen.findByText('Error')).resolves.toBeInTheDocument();
  });

  it('deleteSubmit error', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedRequestErrorState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          deleteComponent={DeleteComponent}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
          allowDelete
          disableGridColumnVirtualization={true}
        />
      </MemoryRouter>
    );

    const removeIcon = (await screen.findByTitle('remove', {}, { timeout: 10000 })).closest('button');
    expect(removeIcon).toBeDefined();
    if (removeIcon) fireEvent.click(removeIcon);

    const deleteModal = await screen.findByText(new RegExp('Delete Confirmation', 'i'));
    expect(deleteModal).toBeDefined();

    const deleteBtnSearch = await screen.findAllByText('Delete');
    const deleteBtn = deleteBtnSearch.find(x => x?.className?.includes('usa-button'));

    if (deleteBtn) fireEvent.click(deleteBtn);

    await expect(screen.findByText('Error')).resolves.toBeInTheDocument();
  });

  it('updatePatch error', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedRequestErrorState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          deleteComponent={DeleteComponent}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
          allowDelete
        />
      </MemoryRouter>
    );

    const rowItem = await screen.findByText('val0');
    fireEvent.click(rowItem);
    const patchBtn = await screen.findByText('Patch');
    fireEvent.click(patchBtn);

    await expect(screen.findByText('Error')).resolves.toBeInTheDocument();
  });

  it('should render infinite scroll', async () => {
    render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
          useDataState={wrappedState}
          columns={[
            new GridColumn({
              field: 'id',
              headerName: 'id'
            }),
            new GridColumn({
              field: 'val',
              headerName: 'val'
            }),
          ]}
          createForm={CreateUpdateTestForm}
          updateForm={CreateUpdateTestForm}
          deleteComponent={DeleteComponent}
          pageTitle="Test Page Title"
          dataTypeName="Test"
          allowEdit={true}
          allowAdd
          allowDelete
          infiniteScrollOptions={{
            enabled: true
          }}
        />
      </MemoryRouter>
    );

    await waitFor(
      () => expect(screen.getAllByText('Test Page Title')).toBeTruthy()
    );
    const tableVal = await screen.findByText('val0');
    expect(tableVal).toBeTruthy();
  });
});

