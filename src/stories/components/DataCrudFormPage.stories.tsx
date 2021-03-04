import React, {ChangeEvent, FormEvent, useState as reactUseState} from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import {Meta, Story} from '@storybook/react';
import {DataCrudFormPageProps} from '../../components/DataCrudFormPage/DataCrudFormPageProps';
import {DataService} from '../../state/data-service/data-service';
import {createState, State, useState} from '@hookstate/core';
import {useCrudPageState} from '../../state/crud-page/crud-page-state';
import GridColumn from '../../components/Grid/GridColumn';
import TextInput from '../../components/forms/TextInput/TextInput';
import Label from '../../components/forms/Label/Label';
import {MemoryRouter} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import Form from '../../components/forms/Form/Form';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {GridRowData} from '../../components/Grid/grid-row-data';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';

import '../../App.scss';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';

export default {
  title: 'Data Crud Form Page',
  component: DataCrudFormPage,
} as Meta;

const Template: Story<DataCrudFormPageProps<any, any>> = (args) => (
    <MemoryRouter>
      <DataCrudFormPage<MockRow, MockDto> {...args} />
    </MemoryRouter>
);

interface MockRow extends GridRowData {
  id?: number,
  name?: string;
  val1?: string;
  val2?: number;
}

interface MockDto {
  id?: number;
  name?: string;
  val1?: string;
  val2SubA?: number;
  val2SubB?: number;
}

const mockData: MockDto[] = [
  { id: 1, name: 'Row 1', val1: 'val 1', val2SubA: 1, val2SubB: 1 },
  { id: 2, name: 'Row 2', val1: 'val 2', val2SubA: 2, val2SubB: 2 },
  { id: 3, name: 'Row 3', val1: 'val 3', val2SubA: 3, val2SubB: 3 },
  { id: 4, name: 'Row 4', val1: 'val 4', val2SubA: 4, val2SubB: 4 },
];

const mockRowData: MockRow[] = mockData?.map((dataItem) => ({
  id: dataItem.id,
  name: dataItem.name,
  val1: dataItem.val1,
  val2: (dataItem.val2SubA || 0) + (dataItem.val2SubB || 0)
}));

const useStateHook = () => useState(createState<MockRow[]>(mockRowData));

class MockDataService implements DataService<MockRow, MockDto> {

  error: string | undefined;
  isPromised: boolean = false;

  constructor(public state: State<MockRow[]>) {

  }

  fetchAndStoreData(): Promise<MockRow[]> {
    return Promise.resolve([]);
  }

  sendCreate(toCreate: MockDto): Promise<MockRow> {
    return new Promise( (resolve, reject) => {
      this.state.set(currentState => {
        const newRow = {
          id: currentState.length + 1,
          name: toCreate.name,
          val1: toCreate.val1,
          val2: (toCreate.val2SubA || 0) + (toCreate.val2SubB || 0)
        };
        resolve(newRow);
        currentState.push(newRow);
        return currentState;
      });
    });
  }

  sendUpdate(toUpdate: MockDto): Promise<MockRow> {
    if ((toUpdate.val2SubA || 0) >= 5) {
      return Promise.reject(new Error('There was a problem with your submission. Val2SubA must be less than 5'));
    }
    this.state.set(currentState => {
      const mockRows: MockRow[] = Object.assign([], currentState);
      const updateIndex = mockRows.findIndex((row) => row.id === toUpdate.id);
      mockRows[updateIndex] = {
        id: toUpdate.id,
        name: toUpdate.name,
        val1: toUpdate.val1,
        val2: (toUpdate.val2SubA || 0) + (toUpdate.val2SubB || 0)
      };
      return mockRows;
    });
    return Promise.resolve({
          id: toUpdate.id,
          name: toUpdate.name,
          val1: toUpdate.val1,
          val2: (toUpdate.val2SubA || 0) + (toUpdate.val2SubB || 0)
    });
  }

  getDtoForRowData(rowData: MockRow): Promise<MockDto> {
    const dataIndex = mockData.findIndex((data) => data.id === rowData.id);
    return Promise.resolve(mockData[dataIndex]);
  }
}

const formSuccess = {
  success: false,
  successMessage: 'Yay! Success.'
};

// TODO: Set as property interface
const CreateForm = (props: CreateUpdateFormProps<MockDto>) => {
  const [dtoState, setDtoState] = reactUseState({
    ...props.data
  });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(dtoState, 'id');
  }

  const closeForm = () => {
    props.onClose();
  }

  const onFieldChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'val2SubA' || field === 'val2SubB' ? event.target.valueAsNumber :
        event.target.value;
    const updatedState = Object.assign({}, dtoState, {[field]: value});
    setDtoState(updatedState);
  }

  // create form scaffold / hoc for this
  return (<Form onSubmit={submitForm}>
    <Label htmlFor="name">Name</Label>
    <TextInput id="name" name="name" type="text" value={dtoState.name} onChange={onFieldChange('name')} />
    <Label htmlFor="val1">Val 1</Label>
    <TextInput id="val1" name="val1" type="text" value={dtoState.val1} onChange={onFieldChange('val1')} />
    <Label htmlFor="val2SubA">Val 2 Sub A</Label>
    <TextInput id="val2SubA" name="val2SubA" type="number" value={dtoState.val2SubA}
               onChange={onFieldChange('val2SubA')} />
    <Label htmlFor="val2SubB">Val 2 Sub B</Label>
    <TextInput id="val2SubB" name="val2SubB" type="number" value={dtoState.val2SubB}
               onChange={onFieldChange('val2SubB')} />
    <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                         errorMessage={props.formErrors?.general || ''}
                         showErrorMessage={props.formErrors?.general != null}
                         showSuccessMessage={props.successAction != null && props.successAction?.success}
                         showCloseButton={true}
                         onCloseClicked={closeForm} />
    {
      props.successAction == null &&
      <SubmitActions formActionType={FormActionType.ADD} onCancel={closeForm} onSubmit={() => {}}
                     isFormValid={true} isFormModified={true} isFormSubmitting={false}
                     />
    }

  </Form>);
}

const columns = [
    new GridColumn('name', false, false, 'Name'),
    new GridColumn('val1', false, false, 'Val 1'),
    new GridColumn('val2', false, false, 'Val 2'),
];


export const TestPage = Template.bind({});
TestPage.args = {
  useDataState: () => new MockDataService(useStateHook()),
  usePageState: useCrudPageState,
  columns,
  createForm: CreateForm,
  updateForm: CreateForm,
  pageTitle: 'Page Title',
  dataTypeName: 'Mock Data',
  allowEdit: true
};
