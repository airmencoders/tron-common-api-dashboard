import React, {FormEvent} from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import Select from '../../components/forms/Select/Select';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import {createState, useState} from '@hookstate/core';
import {Validation} from '@hookstate/validation';
import {Touched} from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { Initial } from '@hookstate/initial';

function ScratchStorageEditForm(props: CreateUpdateFormProps<ScratchStorageAppRegistryDto>) {

  const formState = useState(createState({id: props.data?.id, appName: props.data?.appName ?? '', userPrivs: props.data?.userPrivs}));

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

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
