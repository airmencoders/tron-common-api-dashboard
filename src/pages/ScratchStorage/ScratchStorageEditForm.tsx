import React, {FormEvent} from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import {ScratchStorageAppRegistryDto, UserWithPrivs} from '../../openapi/models';
import {useHookstate, useState} from '@hookstate/core';
import {Validation} from '@hookstate/validation';
import {Touched} from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { Initial } from '@hookstate/initial';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import Button from '../../components/Button/Button';
import Grid from '../../components/Grid/Grid';
import { RowClickedEvent } from 'ag-grid-community';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import { ScratchStorageFlat } from '../../state/scratch-storage/scratch-storage-flat';

interface ScratchStorageEditorState {
  isOpen: boolean;
  data: ScratchStorageUserWithPrivsFlat;
}
function ScratchStorageEditForm(props: CreateUpdateFormProps<ScratchStorageFlat>) {

  const formState = useHookstate<ScratchStorageFlat>({
    id: props.data?.id ?? "",
    appName: props.data?.appName ?? "",
    userPrivs: props.data?.userPrivs ?? []
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  const userEditorState = useHookstate<ScratchStorageEditorState>({
    isOpen: false,
    data: {
      userId: '',
      email: '',
      read: false,
      write: false,
      admin: false
    }
  })

  const userAddState = useHookstate({
    isOpen: false,
  });

  const requiredText = (text: string | undefined): boolean => text != null && text.length > 0 && text.trim().length > 0
  const requiredError = 'cannot be empty or blank';
  Validation(formState.appName).validate(requiredText, requiredError, 'error');


  const isFormModified = (): boolean => {
    const stateKeys = formState.keys;
    let isChanged = false;
    for (let i = 0; i < stateKeys.length; i++) {
      const key = stateKeys[i];
      const origValue = props.data?.[key] == null || props.data[key] === '' ? '' : props.data?.[key];
      const formStateValue = formState[key]?.get() == null || formState[key]?.get() === '' ? '' : formState[key]?.get();
      if (formStateValue !== origValue) {
        isChanged = true;
        break;
      }
    }
    return isChanged
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  const userColumns: GridColumn[] = [
    new GridColumn('email', true, true, 'Email'),
    new GridColumn('read', true, false, 'Read', 'header-center', PrivilegeCellRenderer),
    new GridColumn('write', true, false, 'Write', 'header-center', PrivilegeCellRenderer),
    new GridColumn('admin', true, false, 'Admin', 'header-center', PrivilegeCellRenderer)
  ]

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    userEditorState.merge({
      isOpen: true,
      data: event.data
    });
  }

  const isFormDisabled = ():boolean => {
    return props.successAction?.success || false;
  }

  return (
      <div className="scratch-storage-edit-form">
        <Form onSubmit={submitForm}>
          <FormGroup labelName="appName" labelText="App Name"
                     isError={Touched(formState.appName).touched() && Validation(formState.appName).invalid()}
                     errorMessages={Validation(formState.appName).errors()
                         .map(validationError =>validationError.message)}
          >
            <TextInput id="appName" name="appName" type="text"
                       defaultValue={props.data?.appName || ''}
                       error={Touched(formState.appName).touched() && Validation(formState.appName).invalid()}
                       onChange={(event) => formState.appName.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup
          labelName="scratch-storage-users"
          labelText="Users"
          >
            <Button type='button' onClick={() => userAddState.isOpen.set(true)}>
              Add User
            </Button>
            
            <ItemChooser
              items={formState.userPrivs.get() || []}
              columns={userColumns}
              onRowClicked={onRowClicked}
            />
          </FormGroup>
          <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={props.successAction != null && props.successAction?.success}
                               showCloseButton={true}
                               onCloseClicked={props.onClose} />
          {
            props.successAction == null &&
            <SubmitActions formActionType={props.formActionType}
                           onCancel={props.onClose}
                           onSubmit={submitForm}
                           isFormValid={Validation(formState).valid()}
                           isFormModified={isFormModified()}
                           isFormSubmitting={props.isSubmitting}
            />
          }
        </Form>
      </div>
  );
}

export default ScratchStorageEditForm;
