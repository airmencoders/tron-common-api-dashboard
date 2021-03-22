import React, {ChangeEvent, FormEvent, useEffect} from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import Select from '../../components/forms/Select/Select';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import {PersonDto, PersonDtoBranchEnum} from '../../openapi/models';
import {useState} from '@hookstate/core';
import {Validation} from '@hookstate/validation';
import {Touched} from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import {getEnumKeyByEnumValue} from '../../utils/enum-utils';
import {usePersonState} from '../../state/person/person-state';
import {Initial} from '@hookstate/initial';

import './PersonEditForm.scss';

function PersonEditForm(props: CreateUpdateFormProps<PersonDto>) {
  const personState = usePersonState();
  const formState = useState({...props.data});

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  useEffect(() => {
    const branchValue = formState.branch.get();
    if (branchValue != null) {
      personState.fetchRankForBranch(branchValue);
    }
  }, [formState.branch.get()]);

  useEffect(() => {
    if (!personState.rankState.promised) {
      let formRank = formState.branch.get() === props.data?.branch && props.data?.rank != null ?
          props.data?.rank : undefined;
      if (formRank == null) {
        const availFormRanks = personState.rankState.get()[formState.branch.get() || PersonDtoBranchEnum.Other];
        formRank = availFormRanks != null && availFormRanks.length > 0 && availFormRanks[0].abbreviation ?
            availFormRanks[0].abbreviation : undefined;
      }
      formState.merge({
        rank: formRank
      });
    }
  }, [personState.rankState.promised]);

  const requiredText = (text: string | undefined): boolean => text != null && text.length > 0 && text.trim().length > 0;

  const requiredError = 'cannot be empty or blank';
  Validation(formState.email).validate(requiredText, requiredError, 'error');
  Validation(formState.firstName).validate(requiredText, requiredError, 'error');
  Validation(formState.lastName).validate(requiredText, requiredError, 'error');
  Validation(formState.rank).validate(requiredText, requiredError, 'error');

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

  const onBranchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const stringVal = event.target.value;
    const branchEnumKey = getEnumKeyByEnumValue(PersonDtoBranchEnum, stringVal);
    if (branchEnumKey == null) {
      throw new Error('Selected branch is not part of enum.');
    }
    const branchEnum = PersonDtoBranchEnum[branchEnumKey];
    formState.branch.set(branchEnum);
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
          <FormGroup labelName="dodid" labelText="DoD Id">
            <TextInput id="dodid" name="dodid" type="text"
                       defaultValue={props.data?.dodid || ''}
                       error={Touched(formState.dodid).touched() && Validation(formState.dodid).invalid()}
                       onChange={(event) => formState.dodid.set(event.target.value)}
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
          <FormGroup labelName="phone" labelText="Phone">
            <TextInput id="phone" name="phone" type="text"
                       defaultValue={props.data?.phone || ''}
                       error={Touched(formState.phone).touched() && Validation(formState.phone).invalid()}
                       onChange={(event) => formState.phone.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="dutyPhone" labelText="Duty Phone">
            <TextInput id="dutyPhone" name="dutyPhone" type="text"
                       defaultValue={props.data?.dutyPhone || ''}
                       error={Touched(formState.dutyPhone).touched() && Validation(formState.dutyPhone).invalid()}
                       onChange={(event) => formState.dutyPhone.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="dutyTitle" labelText="Duty Title">
            <TextInput id="dutyTitle" name="dutyTitle" type="text"
                       defaultValue={props.data?.dutyTitle || ''}
                       error={Touched(formState.dutyTitle).touched() && Validation(formState.dutyTitle).invalid()}
                       onChange={(event) => formState.dutyTitle.set(event.target.value)}
                       disabled={isFormDisabled()}
            />
          </FormGroup>
          <FormGroup labelName="branch" labelText="Branch">
            <Select id="branch" name="branch"
                    defaultValue={props.data?.branch || ''}
                    onChange={onBranchChange}
                    disabled={isFormDisabled()}
            >
              {
                Object.values(PersonDtoBranchEnum).map((branchName) => {
                  return <option key={branchName} value={branchName}>{branchName}</option>
                })
              }
            </Select>
          </FormGroup>
          <FormGroup labelName="rank" labelText="Rank"
                     isError={Touched(formState.rank).touched() && Validation(formState.rank).invalid()}
                     errorMessages={Validation(formState.rank).errors()
                         .map(validationError =>validationError.message)}
          >
            {
              personState.rankState.promised ? 'loading ranks...' :
                  <Select id="rank" name="rank"
                          onChange={(event) => {
                            formState.rank.set(event.target.value);
                          }}
                          defaultValue={props.data?.rank || ''}
                          value={formState.get().rank}
                          disabled={isFormDisabled()}
                  >
                    {
                      formState.get().branch && personState.rankState.get()[formState.get()?.branch ||
                          PersonDtoBranchEnum.Other]?.map(rank => (
                          <option key={rank.abbreviation} value={rank.abbreviation}>{rank.abbreviation}</option>
                      ))
                    }
                  </Select>
            }
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

export default PersonEditForm;
