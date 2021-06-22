import React, { ChangeEvent, FormEvent, useEffect } from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import TextInput from '../../components/forms/TextInput/TextInput';
import TextInputInline from "../../components/forms/TextInput/TextInputInline";
import Select from '../../components/forms/Select/Select';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import { PersonDto, PersonDtoBranchEnum } from '../../openapi/models';
import { useState } from '@hookstate/core';
import { Validation } from '@hookstate/validation';
import { Touched } from '@hookstate/touched';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { usePersonState } from '../../state/person/person-state';
import { Initial } from '@hookstate/initial';

import './PersonEditForm.scss';
import { generateStringErrorMessages, failsHookstateValidation, validateEmail, validateRequiredString, validateStringLength, validationErrors, validDoDId, validPhone } from '../../utils/validation-utils';
import {CopyToClipboard} from '../../components/CopyToClipboard/CopyToClipboard';``
import Button from "../../components/Button/Button";
import CopyIcon from "../../icons/CopyIcon";

function PersonEditForm(props: CreateUpdateFormProps<PersonDto>) {
  const personState = usePersonState();
  const formState = useState({ ...props.data });

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

  Validation(formState.firstName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.firstName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.middleName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.lastName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.lastName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.title).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.email).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.email).validate(validateEmail, validationErrors.invalidEmail, 'error');
  Validation(formState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.dodid).validate(validDoDId, validationErrors.invalidDodid, 'error');

  Validation(formState.rank).validate(validateRequiredString, validationErrors.requiredText, 'error');

  Validation(formState.phone).validate(validPhone, validationErrors.invalidPhone, 'error');

  Validation(formState.address).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.dutyPhone).validate(validPhone, validationErrors.invalidPhone, 'error');

  Validation(formState.dutyTitle).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

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

  const isFormDisabled = (): boolean => {
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
        <FormGroup labelName="email" labelText="Email"
          isError={failsHookstateValidation(formState.email)}
          errorMessages={generateStringErrorMessages(formState.email)}
          required
        >
          <TextInput id="email" name="email" type="email"
            defaultValue={props.data?.email || ''}
            error={failsHookstateValidation(formState.email)}
            onChange={(event) => formState.email.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="firstName" labelText="First Name"
          isError={failsHookstateValidation(formState.firstName)}
          errorMessages={generateStringErrorMessages(formState.firstName)}
          required
        >
          <TextInput id="firstName" name="firstName" type="text"
            defaultValue={props.data?.firstName || ''}
            error={failsHookstateValidation(formState.firstName)}
            onChange={(event) => formState.firstName.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="middleName" labelText="Middle Name"
          isError={failsHookstateValidation(formState.middleName)}
          errorMessages={generateStringErrorMessages(formState.middleName)}
        >
          <TextInput id="middleName" name="middleName" type="text"
            defaultValue={props.data?.middleName || ''}
            error={failsHookstateValidation(formState.middleName)}
            onChange={(event) => formState.middleName.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="lastName" labelText="Last Name"
          isError={failsHookstateValidation(formState.lastName)}
          errorMessages={generateStringErrorMessages(formState.lastName)}
          required
        >
          <TextInput id="lastName" name="lastName" type="text"
            defaultValue={props.data?.lastName || ''}
            error={failsHookstateValidation(formState.lastName)}
            onChange={(event) => formState.lastName.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="title" labelText="Title"
          isError={failsHookstateValidation(formState.title)}
          errorMessages={generateStringErrorMessages(formState.title)}
        >
          <TextInput id="title" name="title" type="text"
            defaultValue={props.data?.title || ''}
            error={failsHookstateValidation(formState.title)}
            onChange={(event) => formState.title.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="dodid" labelText="DoD Id"
          isError={failsHookstateValidation(formState.dodid)}
          errorMessages={generateStringErrorMessages(formState.dodid)}
        >
          <TextInput id="dodid" name="dodid" type="text"
            defaultValue={props.data?.dodid || ''}
            error={failsHookstateValidation(formState.dodid)}
            onChange={(event) => formState.dodid.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="address" labelText="Address"
          isError={failsHookstateValidation(formState.address)}
          errorMessages={generateStringErrorMessages(formState.address)}
        >
          <TextInput id="address" name="address" type="text"
            defaultValue={props.data?.address || ''}
            error={failsHookstateValidation(formState.address)}
            onChange={(event) => formState.address.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="phone" labelText="Phone"
          isError={failsHookstateValidation(formState.phone)}
          errorMessages={generateStringErrorMessages(formState.phone)}
        >
          <TextInput id="phone" name="phone" type="text"
            defaultValue={props.data?.phone || ''}
            error={failsHookstateValidation(formState.phone)}
            onChange={(event) => formState.phone.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="dutyPhone" labelText="Duty Phone"
          isError={failsHookstateValidation(formState.dutyPhone)}
          errorMessages={generateStringErrorMessages(formState.dutyPhone)}
        >
          <TextInput id="dutyPhone" name="dutyPhone" type="text"
            defaultValue={props.data?.dutyPhone || ''}
            error={failsHookstateValidation(formState.dutyPhone)}
            onChange={(event) => formState.dutyPhone.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup labelName="dutyTitle" labelText="Duty Title"
          isError={failsHookstateValidation(formState.dutyTitle)}
          errorMessages={generateStringErrorMessages(formState.dutyTitle)}
        >
          <TextInput id="dutyTitle" name="dutyTitle" type="text"
            defaultValue={props.data?.dutyTitle || ''}
            error={failsHookstateValidation(formState.dutyTitle)}
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
          isError={failsHookstateValidation(formState.rank)}
          errorMessages={generateStringErrorMessages(formState.rank)}
          required
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
                      <option key={`${rank.branchType}-${rank.abbreviation}`} value={rank.abbreviation}>{rank.abbreviation}</option>
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
