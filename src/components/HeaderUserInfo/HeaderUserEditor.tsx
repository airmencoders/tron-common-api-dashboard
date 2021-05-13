import React, { FormEvent } from 'react';
import { State, useHookstate } from "@hookstate/core";
import { Validation } from '@hookstate/validation';
import { PersonDto } from '../../openapi';
import { Initial } from '@hookstate/initial';
import { UserEditorState } from './HeaderUserInfo';
import TextInput from '../forms/TextInput/TextInput';
import Form from '../forms/Form/Form';
import FormGroup from '../forms/FormGroup/FormGroup';
import { Touched } from '@hookstate/touched';

interface UserInfoFormProps {
  editorState: State<UserEditorState>;
//   modified: boolean;
//   onSubmit: (toUpdate: State<PersonDto>) => void;
}

function ScratchStorageUserAddForm(props: UserInfoFormProps) {
  const formState = useHookstate<PersonDto>(props.editorState.data.get());

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  const isFormModified = (): boolean => {
    return Initial(formState.address).modified() ||
        Initial(formState.branch).modified() ||
        Initial(formState.dodid).modified() ||
        Initial(formState.dutyPhone).modified() ||
        Initial(formState.dutyTitle).modified() ||
        Initial(formState.firstName).modified() ||
        Initial(formState.lastName).modified() ||
        Initial(formState.middleName).modified() ||
        Initial(formState.phone).modified() ||
        Initial(formState.rank).modified() ||
        Initial(formState.title).modified(); 
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // props.onSubmit(formState);
  }

  return (
    <Form className="header-user-editor-form" onSubmit={onSubmit} data-testid="sheader-user-editor-form">
      {/* <FormGroup labelName="email" labelText="Email"
                  isError={isError(formState.email)}
                  errorMessages={errorMessages(formState.email)}
      >
      <TextInput id="email" name="email" type="email"
          defaultValue={props.data?.email || ''}
          error={Touched(formState.email).touched() && Validation(formState.email).invalid()}
          onChange={(event) => formState.email.set(event.target.value)}
          disabled={isFormDisabled()}
      />
      </FormGroup> */}
      <FormGroup labelName="firstName" labelText="First Name"
                  isError={Touched(formState.firstName).touched() && Validation(formState.firstName).invalid()}
                  errorMessages={Validation(formState.firstName).errors()
                      .map(validationError =>validationError.message)}
      >
      <TextInput id="firstName" name="firstName" type="text"
                  value={formState.firstName.get() || ''}
                  error={Touched(formState.firstName).touched() && Validation(formState.firstName).invalid()}
                  onChange={(event) => formState.firstName.set(event.target.value)}
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
                  value={formState?.lastName.get() || ''}
                  error={Touched(formState.lastName).touched() && Validation(formState.lastName).invalid()}
                  onChange={(event) => formState.lastName.set(event.target.value)}
      />
      </FormGroup>
      <hr/>
      {/* <FormGroup labelName="title" labelText="Title">
      <TextInput id="title" name="title" type="text"
                  defaultValue={props.data?.title || ''}
                  error={Touched(formState.title).touched() && Validation(formState.title).invalid()}
                  onChange={(event) => formState.title.set(event.target.value)}
                  disabled={isFormDisabled()}
      />
      </FormGroup>
      <FormGroup labelName="dodid" labelText="DoD Id"
              isError={isError(formState.dodid)}
              errorMessages={errorMessages(formState.dodid)}>
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
      <FormGroup labelName="phone" labelText="Phone"
                  isError={isError(formState.phone)}
                  errorMessages={errorMessages(formState.phone)}>
      <TextInput id="phone" name="phone" type="text"
                  defaultValue={props.data?.phone || ''}
                  error={Touched(formState.phone).touched() && Validation(formState.phone).invalid()}
                  onChange={(event) => formState.phone.set(event.target.value)}
                  disabled={isFormDisabled()}
      />
      </FormGroup>
      <FormGroup labelName="dutyPhone" labelText="Duty Phone"
                  isError={isError(formState.dutyPhone)}
                  errorMessages={errorMessages(formState.dutyPhone)}>
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
      </FormGroup> */}
    </Form>
  );
}

export default ScratchStorageUserAddForm;
