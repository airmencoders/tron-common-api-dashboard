import React, {FormEvent} from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import Label from '../../components/forms/Label/Label';
import Select from '../../components/forms/Select/Select';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import {PersonDto} from '../../openapi/models';
import {createState, useState} from '@hookstate/core';
import {Validation} from '@hookstate/validation';
import {Touched} from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import {FormActionType} from '../../state/crud-page/form-action-type';
import equal from 'fast-deep-equal/es6';

// use enum values form person dto
const branches = [
    'USA',
    'USAF',
    'USMC',
    'USN',
    'USSF',
    'USCG',
    'OTHER',
];

function PersonEditForm(props: CreateUpdateFormProps<PersonDto>) {

  const formState = useState(createState({...props.data}));

  formState.attach(Validation);
  formState.attach(Touched);

  const requiredText = (text: string | undefined): boolean => text != null && text.length > 0 && text.trim().length > 0
  const requiredError = 'cannot be empty or blank';
  Validation(formState.email).validate(requiredText, requiredError, 'error');
  Validation(formState.firstName).validate(requiredText, requiredError, 'error');
  Validation(formState.lastName).validate(requiredText, requiredError, 'error');


  const isFormModified = (): boolean => {
    const stateKeys = formState.keys;
    let isChanged = false;
    for (let i = 0; i < stateKeys.length; i++) {
      const key = stateKeys[i];
      const origValue = props.data[key] == null || props.data[key] === '' ? '' : props.data[key];
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
    return props.successAction?.success;
  }

  return (
      <div className="person-edit-form">
        <Form onSubmit={submitForm}>
          <FormGroup labelName="email" labelText="Email"
                     isError={Touched(formState.email).touched() && Validation(formState.email).invalid()}
                     errorMessages={Validation(formState.email).errors()
                         .map(validationError =>validationError.message)}
          >
            <TextInput id="email" name="email" type="email"
              defaultValue={props.data?.email || ''}
              error={Touched(formState.email).touched() && Validation(formState.email).invalid()}
              onChange={(event) => formState.email.set(event.target.value)}
              disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="firstName" labelText="First Name"
                     isError={Touched(formState.firstName).touched() && Validation(formState.firstName).invalid()}
                     errorMessages={Validation(formState.firstName).errors()
                         .map(validationError =>validationError.message)}
          >
            <TextInput id="firstName" name="firstName" type="text"
                       defaultValue={props.data?.firstName || ''}
                       error={Touched(formState.firstName).touched() && Validation(formState.firstName).invalid()}
                       onChange={(event) => formState.firstName.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="middleName" labelText="Middle Name">
            <TextInput id="middleName" name="middleName" type="text" />
          </FormGroup>
          <FormGroup labelName="lastName" labelText="Last Name"
                     isError={Touched(formState.lastName).touched() && Validation(formState.lastName).invalid()}
                     errorMessages={Validation(formState.lastName).errors()
                         .map(validationError =>validationError.message)}
          >
            <TextInput id="lastName" name="lastName" type="text"
                       defaultValue={props.data?.lastName || ''}
                       error={Touched(formState.lastName).touched() && Validation(formState.lastName).invalid()}
                       onChange={(event) => formState.lastName.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="title" labelText="Title">
            <TextInput id="title" name="title" type="text"
                       defaultValue={props.data?.title || ''}
                       error={Touched(formState.title).touched() && Validation(formState.title).invalid()}
                       onChange={(event) => formState.title.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="address" labelText="Address">
            <TextInput id="address" name="address" type="text"
                       defaultValue={props.data?.address || ''}
                       error={Touched(formState.address).touched() && Validation(formState.address).invalid()}
                       onChange={(event) => formState.address.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="branch" labelText="Branch">
            <Select id="branch" name="branch"
                    defaultValue={props.data?.branch || ''}
                    onChange={(event) => formState.rank.set(event.target.value)}
                    disabled={isFormDisabled()}
            >
              {
                branches.map((branchName) => (
                    <option value={branchName}>{branchName}</option>
                ))
              }
            </Select>
          </FormGroup>
          <SuccessErrorMessage successMessage={props.successAction?.successMsg}
                               errorMessage={props.formErrors?.general || ''}
                               showErrorMessage={props.formErrors?.general != null}
                               showSuccessMessage={props.successAction != null && props.successAction?.success}
                               showCloseButton={true}
                               onCloseClicked={props.onClose} />
          {
            props.successAction == null &&
            <SubmitActions formActionType={FormActionType.ADD}
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

export default PersonEditForm;
