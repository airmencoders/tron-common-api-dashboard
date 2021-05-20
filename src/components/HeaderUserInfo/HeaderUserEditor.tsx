import React, { ChangeEvent, FormEvent, useEffect } from 'react';
import { State, useHookstate } from "@hookstate/core";
import { Validation } from '@hookstate/validation';
import { PersonDto, PersonDtoBranchEnum } from '../../openapi/models';
import { Initial } from '@hookstate/initial';
import { UserEditorState } from './HeaderUserInfo';
import TextInput from '../forms/TextInput/TextInput';
import Form from '../forms/Form/Form';
import FormGroup from '../forms/FormGroup/FormGroup';
import { Touched } from '@hookstate/touched';
import './HeaderUserEditor.scss';
import Select from '../forms/Select/Select';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { usePersonState } from '../../state/person/person-state';
import { RankStateModel } from '../../state/person/rank-state-model';
import { validPhone } from '../../utils/validation-utils';
import { useUserInfoState } from '../../state/user/user-info-state';
interface UserInfoFormProps {
  editorState: State<UserEditorState>;
  userInitials: string;
}

function ScratchStorageUserAddForm(props: UserInfoFormProps) {
  const personState = usePersonState();
  const rankState = useHookstate<RankStateModel>(personState.rankState);
  const formState = useHookstate<PersonDto>(props.editorState.currentUserState.get());
  
  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  useEffect(() => {
    const branchValue = formState.branch.get();
    if (branchValue != null) {
      personState.fetchRankForBranch(branchValue);
    }
  }, [formState.branch.get()]);

  const isError = (formState: State<string | undefined>) => Touched(formState).touched() && Validation(formState).invalid()
  const errorMessages = (formState: State<string | undefined>) => Validation(formState).errors().map(validationError =>validationError.message)

  const requiredText = (text: string | undefined): boolean => text != null && text.length > 0 && text.trim().length > 0;

  const requiredError = 'cannot be empty or blank';
  Validation(formState.firstName).validate(requiredText, requiredError, 'error');
  Validation(formState.lastName).validate(requiredText, requiredError, 'error');
  Validation(formState.rank).validate(requiredText, requiredError, 'error');

  const validPhoneError = 'Enter a valid phone number'
  Validation(formState.phone).validate(validPhone, validPhoneError, 'error');
  Validation(formState.dutyPhone).validate(validPhone, validPhoneError, 'error');

  const isFormModified = (): boolean => {
    return props.editorState.original && (props.editorState.get().currentUserState.get().address !== props.editorState.get().original?.address
        || props.editorState.get().currentUserState.get().branch !== props.editorState.get().original?.branch
        || props.editorState.get().currentUserState.get().dutyPhone !== props.editorState.get().original?.dutyPhone
        || props.editorState.get().currentUserState.get().dutyTitle !== props.editorState.get().original?.dutyTitle
        || props.editorState.get().currentUserState.get().firstName !== props.editorState.get().original?.firstName
        || props.editorState.get().currentUserState.get().lastName !== props.editorState.get().original?.lastName
        || props.editorState.get().currentUserState.get().middleName !== props.editorState.get().original?.middleName
        || props.editorState.get().currentUserState.get().phone !== props.editorState.get().original?.phone
        || props.editorState.get().currentUserState.get().rank !== props.editorState.get().original?.rank
        || props.editorState.get().currentUserState.get().title !== props.editorState.get().original?.title
    );
  }

  useEffect(() => {
    props.editorState.disableSubmit.set(Validation(formState).invalid() || !isFormModified());
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    <div className="header-user-editor">
      <Form className="header-user-editor-form" onSubmit={onSubmit} data-testid="header-user-editor-form">
        <div className="user-editor-header">
          <div className="user-editor-content">
            <div className="d-flex align-items-center">
              <div className="header-user-editor__initials">
                {props.userInitials}
              </div>  
              <div>
                <div className="user-editor-email">{formState.email.get()?.toUpperCase()}</div>
                <div className="user-editor-dodid text-muted">{formState.dodid.get()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="user-editor-body">
          <div className="d-flex justify-content-between">
            <div>
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
            </div>
            <div>
              <FormGroup labelName="middleName" labelText="Middle Name">
                <TextInput id="middleName" name="middleName" type="text"
                            value={formState?.middleName.get() || ''}
                            error={Touched(formState.middleName).touched() && Validation(formState.middleName).invalid()}
                            onChange={(event) => formState.middleName.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
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
            </div>
            <div>
              <FormGroup labelName="title" labelText="Title">
              <TextInput id="title" name="title" type="text"
                          defaultValue={formState?.title.get() || ''}
                          error={Touched(formState.title).touched() && Validation(formState.title).invalid()}
                          onChange={(event) => formState.title.set(event.target.value)}
              />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex">
            <div className="flex-grow-1">
            <FormGroup labelName="address" labelText="Address">
            <TextInput id="address" name="address" type="text"
                        className="d-flex flex-grow-1"
                        defaultValue={formState?.address.get() || ''}
                        error={Touched(formState.address).touched() && Validation(formState.address).invalid()}
                        onChange={(event) => formState.address.set(event.target.value)}
            />
            </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <FormGroup labelName="phone" labelText="Phone"
                          isError={isError(formState.phone)}
                          errorMessages={errorMessages(formState.phone)}>
                <TextInput id="phone" name="phone" type="text"
                            defaultValue={formState?.phone.get() || ''}
                            error={Touched(formState.phone).touched() && Validation(formState.phone).invalid()}
                            onChange={(event) => formState.phone.set(event.target.value)}
                />
              </FormGroup>
            </div>
            <div>
              <FormGroup labelName="dutyPhone" labelText="Duty Phone"
                          isError={isError(formState.dutyPhone)}
                          errorMessages={errorMessages(formState.dutyPhone)}>
                <TextInput id="dutyPhone" name="dutyPhone" type="text"
                            defaultValue={formState?.dutyPhone.get() || ''}
                            error={Touched(formState.dutyPhone).touched() && Validation(formState.dutyPhone).invalid()}
                            onChange={(event) => formState.dutyPhone.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <FormGroup labelName="dutyTitle" labelText="Duty Title">
                <TextInput id="dutyTitle" name="dutyTitle" type="text"
                            defaultValue={formState?.dutyTitle.get() || ''}
                            error={Touched(formState.dutyTitle).touched() && Validation(formState.dutyTitle).invalid()}
                            onChange={(event) => formState.dutyTitle.set(event.target.value)}
                />
              </FormGroup>
            </div>
            <div>
              <div className="d-flex justify-content-between branch-rank-container">
                <div>
                  <FormGroup labelName="branch" labelText="Branch">
                    <Select id="branch" name="branch"
                            defaultValue={formState?.branch.get() || ''}
                            onChange={onBranchChange}
                    >
                      {
                        Object.values(PersonDtoBranchEnum).map((branchName) => {
                            return <option key={branchName} value={branchName}>{branchName}</option>
                        })
                      }
                    </Select>
                  </FormGroup>
                </div>
                <div>
                  <FormGroup labelName="rank" labelText="Rank"
                              isError={Touched(formState.rank).touched() && Validation(formState.rank).invalid()}
                              errorMessages={Validation(formState.rank).errors()
                                  .map(validationError =>validationError.message)}
                  >
                    {
                      rankState.promised ? 'loading ranks...' :
                        <Select id="rank" name="rank"
                                onChange={(event) => {
                                formState.rank.set(event.target.value);
                                }}
                                defaultValue={formState?.rank.get() || ''}
                                value={formState.get().rank}
                        >
                          {
                            formState.get().branch && rankState.get()[formState.get()?.branch ||
                                PersonDtoBranchEnum.Other]?.map(rank => (
                                <option key={rank.abbreviation} value={rank.abbreviation}>{rank.abbreviation}</option>
                            ))
                          }
                        </Select>
                    }
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>
            <div className="success-error-message">
                <p className="success-container__validation-error">{props.editorState.errorMessage.get()}</p>
            </div>
        </div>
      </Form>
    </div>
  );
}

export default ScratchStorageUserAddForm;
