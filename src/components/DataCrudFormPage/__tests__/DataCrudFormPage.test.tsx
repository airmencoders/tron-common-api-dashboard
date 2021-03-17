import {render, waitFor, screen, fireEvent} from '@testing-library/react';
import {DataCrudFormPage} from '../DataCrudFormPage';
import {DataService} from '../../../state/data-service/data-service';
import { createState, none, State, useState } from '@hookstate/core';
import GridColumn from '../../Grid/GridColumn';
import {MemoryRouter} from 'react-router-dom';

import React from 'react';

interface TestRow {
  id: string;
  val: string;
}

interface TestDto {
  id: string;
  val: string;
}

const testState = createState(new Array<TestRow>());

const useTestState = () => useState(testState);

class TestDataService implements DataService<TestRow, TestDto> {
  isPromised = false;
  error = undefined;

  constructor(public state: State<TestRow[]>) { }

  fetchAndStoreData():Promise<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0'},
      { id: '1', val: 'val1'},
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

  convertRowDataToEditableData(rowData: TestRow): Promise<TestDto> {
    const values = this.state.get();
    const foundData = values.find(row => row.id === rowData.id);
    if (foundData == null) {
      return Promise.reject();
    }
    return Promise.resolve(foundData);
  }
}

class TestDataErrorService implements DataService<TestRow, TestDto> {
  isPromised = false;
  error = 'error';

  constructor(public state: State<TestRow[]>) { }

  fetchAndStoreData():Promise<TestRow[]> {
    const initData = [
      { id: '0', val: 'val0'},
      { id: '1', val: 'val1'},
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

  convertRowDataToEditableData(rowData: TestRow): Promise<TestDto> {
    const values = this.state.get();
    const foundData = values.find(row => row.id === rowData.id);
    if (foundData == null) {
      return Promise.reject();
    }
    return Promise.resolve(foundData);
  }
}

const wrappedState = () => new TestDataService(useTestState());
const wrappedErrorState = () => new TestDataErrorService(useTestState());

const CreateUpdateTestForm = ({onSubmit, successAction}: any) => {
  return (
      <div data-testid="form">
        <div>Form</div>
        <div>{successAction?.successMsg ? 'Successfully' : 'Not Submit'}</div>
        <button onClick={() => onSubmit({id: '0', val: 'val01'})}>Submit</button>

      </div>
  )
}

it('should render', async () => {

  render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
            useDataState={wrappedState}
            columns={[
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
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
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
            ]}
            createForm={CreateUpdateTestForm}
            updateForm={CreateUpdateTestForm}
            pageTitle="Test Page Title"
            dataTypeName="Test"
            allowEdit={true} />
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
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
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
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
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
        <DataCrudFormPage<TestRow, TestDto>
            useDataState={wrappedState}
            columns={[
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
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
      () => expect(screen.getByText('Successfully')).toBeTruthy(),
  )
});

it('should show success message for successful create', async () => {
  render(
      <MemoryRouter>
        <DataCrudFormPage<TestRow, TestDto>
            useDataState={wrappedState}
            columns={[
              new GridColumn('id', false, false, 'id'),
              new GridColumn('val', false, false, 'val'),
            ]}
            createForm={CreateUpdateTestForm}
            updateForm={CreateUpdateTestForm}
            pageTitle="Test Page Title"
            dataTypeName="Test"
            allowEdit={true} />
      </MemoryRouter>
  );

  await screen.findByText('Add Test');
  fireEvent.click(screen.getByText('Add Test'));
  await screen.findByText('Submit');
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(
      () => expect(screen.getByText('Successfully')).toBeTruthy(),
  )
});

