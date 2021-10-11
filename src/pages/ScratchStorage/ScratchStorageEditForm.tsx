import { Downgraded, none, State, useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { RowClickedEvent } from 'ag-grid-community';
import React, { FormEvent } from 'react';
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import GridColumn from '../../components/Grid/GridColumn';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalTitle from '../../components/Modal/ModalTitle';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { ScratchStorageEntryDto } from '../../openapi';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { ScratchStorageFlat } from '../../state/scratch-storage/scratch-storage-flat';
import { useScratchStorageState } from '../../state/scratch-storage/scratch-storage-state';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import { failsHookstateValidation, generateStringErrorMessages, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import './ScratchStorageEditForm.scss';
import ScratchStorageKeyValueEditorForm from './ScratchStorageKeyValueEditorForm';
import ScratchStorageUserAddForm from './ScratchStorageUserAddForm';

export interface ScratchStorageEditorState {
  isOpen: boolean;
  data: ScratchStorageUserWithPrivsFlat;
  errorMessage: string;
  original: ScratchStorageUserWithPrivsFlat;
}

export interface ScratchStorageCreateUpdateState {
  isEdit: boolean;
  isOpen: boolean;
  keyName: string;
  appId: string;
}

function ScratchStorageEditForm(props: CreateUpdateFormProps<ScratchStorageFlat>) {
  const authorizedUserState = useAuthorizedUserState();
  const formState = useHookstate<ScratchStorageFlat>({
    id: props.data?.id ?? "",
    appName: props.data?.appName ?? "",
    appHasImplicitRead: props.data?.appHasImplicitRead ?? false,
    userPrivs: props.data?.userPrivs ?? [],
    aclMode: props.data?.aclMode,
    keyNames: props.data?.keyNames ?? [],
  });
  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  const scratchStorageService = useScratchStorageState();

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

  const userAddState = useHookstate({ isOpen: false, });
  const keyCreateEditState = useHookstate<ScratchStorageCreateUpdateState>({
    isEdit: false,
    isOpen: false,
    keyName: '',
    appId: props.data?.id ?? ""
  });
  const keyValue = useHookstate<string>('');  // state to hold an existing key value's value (when editing)

  Validation(formState.appName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.appName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  keyCreateEditState.attach(Validation);
  keyCreateEditState.attach(Initial);
  keyCreateEditState.attach(Touched);
  Validation(keyCreateEditState.keyName).validate(value => !(/\s/.test(value)), 'Key Name cannot contain white space', 'error');
  Validation(keyCreateEditState.keyName).validate(value => value !== '', 'Key Name cannot be blank', 'error');

  const isFormModified = (): boolean => {
    return Initial(formState.appName).modified() ||
      Initial(formState.appHasImplicitRead).modified() ||
      Initial(formState.userPrivs).modified() ||
      Initial(formState.keyNames).modified() ||
      scratchStorageService.createUpdateState.length !== 0;
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
      resizable: true,
      initialWidth: 175,
      headerName: 'Email'
    }),
    new GridColumn({
      field: 'read',
      sortable: true,
      headerName: 'Read',
      headerClass: 'header-center',
      resizable: true,
      initialWidth: 100,
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'write',
      sortable: true,
      headerName: 'Write',
      headerClass: 'header-center',
      resizable: true,
      initialWidth: 100,
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'admin',
      sortable: true,
      headerName: 'Admin',
      headerClass: 'header-center',
      resizable: true,
      initialWidth: 100,
      cellRenderer: PrivilegeCellRenderer
    })
  ];

  const keyColumns: GridColumn[] = [
    new GridColumn({
      field: 'name',
      resizable: true,
      headerName: 'Key Name',
    }),
  ];

  if(!isFormDisabled()) {
    userColumns.push(
      new GridColumn({
        field: '',
        headerName: deleteBtnName,
        headerClass: 'header-center',
        initialWidth: 75,
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: removeUser }
      })
    );
    keyColumns.push(new GridColumn({
        headerName: deleteBtnName,
        headerClass: 'header-center',
        initialWidth: 50,
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: removeKey }
      })
    );
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

  // removes a key from the keys ag-grid (marks it for deletion essentially)
  function removeKey(data: { name: string }) {
    if(!isFormDisabled()) {
      formState.keyNames.find(item => item.get() === data.name)?.set(none);
      scratchStorageService.deleteState.set([...scratchStorageService.deleteState.get(), data.name]);
    }
  }

  // cancels/closes out of the key-value editor dialog
  function keyEditorCloseHandler() {
    keyCreateEditState.merge({
      isOpen: false,
      isEdit: false,
      keyName: '',
    });
    keyValue.set('');
  }

  // key value editor dialog acknowledged, close the editor dialog, reset create/edit state,
  //  and add key-value pair to the create/update state in the service
  function keyEditorSubmit() {

    // convert state into a DTO
    const kvp : ScratchStorageEntryDto = {
      appId: keyCreateEditState.appId.value,
      key: keyCreateEditState.keyName.value,
      value:  keyValue.value,
    }

    keyCreateEditState.merge({
      isOpen: false,
      isEdit: false,
      keyName: '',
    });

    // add to the key-values to create on submission (if its already in there, update its value)
    const index = scratchStorageService.createUpdateState.get().findIndex(item => item.key === kvp.key);
    if (index === -1) {
      scratchStorageService.createUpdateState.merge([kvp]);
    }
    else {
      scratchStorageService.createUpdateState[index].set(kvp);
    }

    // add to the ag-grid list of keys if not already in there
    if (!formState.keyNames.get().includes(kvp.key)) {
      formState.keyNames.set([...formState.keyNames.get(), kvp.key ]);
    }
  }

  // we want to create a key value pair, create a blank key and open the editor dialog
  function onAddKeyValue() {
    keyCreateEditState.merge({
      isOpen: true,
      isEdit: false,
      keyName: '',
    });
    keyValue.set('');
  }

  // we want to edit a key value pair
  function onKeyRowClick(event: RowClickedEvent) {
    // Don't trigger row clicked if delete cell clicked or if the form is disabled
    if ((event.api.getFocusedCell()?.column.getColDef().headerName === deleteBtnName || isFormDisabled()))
      return;

    keyCreateEditState.merge({
      isOpen: true,
      isEdit: true,
      keyName: event.data.name,
    });
  }

  return (
      <div className="scratch-storage-edit-form">
        <Form onSubmit={submitForm} data-testid="scratch-storage-form">

          <FormGroup labelName="appId" labelText="App ID">
            <TextInput id="appId" name="appId" type="text"
                        className="scratch-storage-edit-form__appId"
                        defaultValue={props.data?.id || ''}
                        error={failsHookstateValidation(formState.id)}
                        disabled={true}
            />
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
              disabled={isFormDisabled() || formState.aclMode.get()}
            />
            <Checkbox
              id="acl_mode"
              name="acl_mode"
              label={<>ACL Mode</>}
              checked={formState.aclMode.get()}
              onChange={(event) => formState.aclMode.set(event.target.checked)}
              disabled={isFormDisabled()}
            />
          <FormGroup
          labelName="scratch-storage-users"
          labelText="User Access"
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
          <FormGroup
            labelName="scratch-storage-keys"
            labelText={`Key / Values (${formState.keyNames.length} Total)`}
          >
            <Button
              data-testid='add-kvp-btn'
              type='button'
              className="scratch-storage-edit-form__mb1"
              onClick={() => onAddKeyValue()}
              disabled={isFormDisabled() ||
                !(formState.userPrivs.get().filter(item => item.email ===
                    authorizedUserState.authorizedUser?.email && item.admin).length > 0)}
            >
              Add Key/Value
            </Button>
            <ItemChooser
              items={[...formState.keyNames.get()].sort().map(item => ({ name: item }))}
              columns={keyColumns}
              onRowClicked={onKeyRowClick}
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
          data-testid='new-scratch-user-dlg'
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
            onSubmit={onAddUser}
          />
        </Modal>
        <Modal
          headerComponent={<ModalTitle title={keyCreateEditState.isEdit.get() ? "Edit Key/Value" : "Create Key/Value"} />}
          footerComponent={<ModalFooterSubmit
            onCancel={keyEditorCloseHandler}
            onSubmit={keyEditorSubmit}
            disableSubmit={!(Validation(keyCreateEditState.keyName).valid())}
            submitText="Save Key/Value"
          />}
          show={keyCreateEditState.isOpen.get()}
          onHide={keyEditorCloseHandler}
          width="75%"
          height="auto"
        >
          <ScratchStorageKeyValueEditorForm
            createUpdateState={keyCreateEditState}
            onSubmit={keyEditorSubmit}
            valueState={keyValue}
          />
        </Modal>
      </div>
  );
}

export default ScratchStorageEditForm;
