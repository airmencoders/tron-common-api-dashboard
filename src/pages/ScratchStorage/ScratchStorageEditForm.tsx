import React, {FormEvent} from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import TextInputInline from "../../components/forms/TextInput/TextInputInline";
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import {Downgraded, none, State, useHookstate } from '@hookstate/core';
import {Validation} from '@hookstate/validation';
import {Touched} from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { Initial } from '@hookstate/initial';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import Button from '../../components/Button/Button';
import { RowClickedEvent } from 'ag-grid-community';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import { ScratchStorageFlat } from '../../state/scratch-storage/scratch-storage-flat';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import './ScratchStorageEditForm.scss';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ScratchStorageUserAddForm from './ScratchStorageUserAddForm';
import { generateStringErrorMessages, failsHookstateValidation, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import {CopyToClipboard} from '../../components/CopyToClipboard/CopyToClipboard';

export interface ScratchStorageEditorState {
  isOpen: boolean;
  data: ScratchStorageUserWithPrivsFlat;
  errorMessage: string;
  original: ScratchStorageUserWithPrivsFlat;
}

function ScratchStorageEditForm(props: CreateUpdateFormProps<ScratchStorageFlat>) {

  const formState = useHookstate<ScratchStorageFlat>({
    id: props.data?.id ?? "",
    appName: props.data?.appName ?? "",
    appHasImplicitRead: props.data?.appHasImplicitRead ?? false,
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
    },
    errorMessage: '',
    original: {
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

  Validation(formState.appName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.appName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  const isFormModified = (): boolean => {
    return Initial(formState.appName).modified() ||
      Initial(formState.appHasImplicitRead).modified() ||
      Initial(formState.userPrivs).modified();
  }

  const isFormDisabled = ():boolean => {
    return props.successAction?.success || props.isSubmitting;
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  function onUpdateUser(toUpdate: State<ScratchStorageUserWithPrivsFlat>) {
    const downgraded = toUpdate.attach(Downgraded).get();
    formState.userPrivs.find(item => item.get().email === downgraded.email)?.set(downgraded);
    userEditorState.merge({
      original: downgraded
    });
  }  
  
  function onAddUser(toUpdate: State<ScratchStorageUserWithPrivsFlat>) {
    try{
      userEditorState.errorMessage.set('');

      if(formState.userPrivs.some(item => item.get().email === toUpdate.email.get()))
        throw new Error('* Email already exists.');

      formState.userPrivs[formState.userPrivs.length].set(Object.assign({}, toUpdate.get()));
      toUpdate.set({
        userId: '',
        email: '',
        read: false,
        write: false,
        admin: false
      });
    } catch (error) {
      userEditorState.errorMessage.set(error.message);
    }
  }

  const deleteBtnName = 'Delete';
  const userColumns: GridColumn[] = [
    new GridColumn({
      field: 'email', 
      sortable: true,
      filter: true,
      headerName: 'Email'
    }),
    new GridColumn({
      field: 'read',
      sortable: true,
      headerName: 'Read',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'write',
      sortable: true,
      headerName: 'Write',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'admin',
      sortable: true,
      headerName: 'Admin',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    })
  ];

  if(!isFormDisabled()) {
    userColumns.push(
      new GridColumn({
        field: '',
        headerName: deleteBtnName,
        headerClass: 'header-center',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: removeUser }
      })
    )
  }

  function removeUser(data: ScratchStorageUserWithPrivsFlat) {
    if(!isFormDisabled())
      formState.userPrivs.find(item => item.get().email === data.email)?.set(none);
  }

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    // Don't trigger row clicked if delete cell clicked or if the form is disabled
    if ((event.api.getFocusedCell()?.column.getColDef().headerName === deleteBtnName ||
      isFormDisabled()))
      return;

    userEditorState.merge({
      isOpen: true,
      data: event.data,
      original: event.data
    });
  }

  function userEditorCloseHandler() {
    userEditorState.merge({
      isOpen: false,
      data: {
        userId: '',
        email: '',
        read: false,
        write: false,
        admin: false
      },
      errorMessage: '',
      original: {
        userId: '',
        email: '',
        read: false,
        write: false,
        admin: false
      },
    });
  }

  function userEditorSubmitModal() {
    userEditorCloseHandler();
  }

  function userAddCloseHandler() {
    userAddState.merge({
      isOpen: false
    });
  }

  function userAddSubmitModal() {
    userAddCloseHandler();
    userEditorCloseHandler();
  }

  return (
      <div className="scratch-storage-edit-form">
        <Form onSubmit={submitForm} data-testid="scratch-storage-form">
          <FormGroup
              labelName="uuid"
              labelText="UUID"
              isError={false}
          >
            <TextInputInline
                id="uuid"
                name="uuid"
                type="text"
                defaultValue={formState.id.get()}
                disabled={true}
                className={'tron-text-input-inline'}
            />
            <CopyToClipboard text={String(formState.id.get())} />
          </FormGroup>
          <FormGroup labelName="appName" labelText="App Name"
                     isError={failsHookstateValidation(formState.appName)}
                     errorMessages={generateStringErrorMessages(formState.appName)}
                     required
          >
            <TextInput id="appName" name="appName" type="text"
                       className="scratch-storage-edit-form__mb1" 
                       defaultValue={props.data?.appName || ''}
                       error={failsHookstateValidation(formState.appName)}
                       onChange={(event) => formState.appName.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
            <Checkbox
              id="implicit_read"
              name="implicit_read"
              label={<>Implicit Read</>}
              checked={formState.appHasImplicitRead.get()}
              onChange={(event) => formState.appHasImplicitRead.set(event.target.checked)}
              disabled={isFormDisabled()}
            />
          <FormGroup
          labelName="scratch-storage-users"
          labelText="Users"
          >
            <Button type='button' className="scratch-storage-edit-form__mb1" onClick={() => userAddState.isOpen.set(true)} disabled={isFormDisabled()}>
              Add User
            </Button>
            
            <ItemChooser
              items={formState.userPrivs.get()}
              columns={userColumns}
              onRowClicked={onRowClicked}
              hardRefresh
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
        <Modal
          headerComponent={<ModalTitle title="User Editor" />}
          footerComponent={<ModalFooterSubmit
            hideCancel
            onSubmit={userEditorSubmitModal}
            submitText="Done"
          />}
          show={userEditorState.isOpen.get()}
          onHide={userEditorCloseHandler}
          width="auto"
          height="auto"
        >
        <ScratchStorageUserAddForm 
          editorState={userEditorState} 
          onSubmit={onUpdateUser} 
          isUpdate={true}
        />
        </Modal>
        <Modal
          headerComponent={<ModalTitle title="Add User Editor" />}
          footerComponent={<ModalFooterSubmit
            hideCancel
            onSubmit={userAddSubmitModal}
            submitText="Done"
          />}
          show={userAddState.isOpen.get()}
          onHide={userAddCloseHandler}
          width="auto"
          height="auto"
        >
          <ScratchStorageUserAddForm
            editorState= {userEditorState}
            onSubmit= {onAddUser} 
          />
        </Modal>
      </div>
  );
}

export default ScratchStorageEditForm;
