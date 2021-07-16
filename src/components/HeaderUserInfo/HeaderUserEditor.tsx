import React, { ChangeEvent, FormEvent, useEffect } from 'react';
import { State, useHookstate } from "@hookstate/core";
import { Validation } from '@hookstate/validation';
import { PersonDtoBranchEnum } from '../../openapi/models';
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
import { failsHookstateValidation, generateStringErrorMessages, isFormModified, validateRequiredString, validateStringLength, validationErrors, validPhone } from '../../utils/validation-utils';
import withLoading from '../../hocs/UseLoading/WithLoading';

interface UserInfoFormProps {
  editorState: State<UserEditorState>;
  userInitials: string;
}

function HeaderUserEditor(props: UserInfoFormProps) {
  const personState = usePersonState();
  const rankState = useHookstate<RankStateModel>(personState.rankState);
  const formState = useHookstate(props.editorState.currentUserState);
  
  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.firstName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.firstName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.middleName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.lastName).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.lastName).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.title).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.rank).validate(validateRequiredString, validationErrors.requiredText, 'error');

  Validation(formState.phone).validate(validPhone, validationErrors.invalidPhone, 'error');

  Validation(formState.address).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.dutyPhone).validate(validPhone, validationErrors.invalidPhone, 'error');

  Validation(formState.dutyTitle).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  useEffect(() => {
    const branchValue = formState.branch.get();
    if (branchValue != null) {
      personState.fetchRankForBranch(branchValue);
    }
  }, [formState.branch.get()]);

  useEffect(() => {
    props.editorState.disableSubmit.set(Validation(formState).invalid() || !isFormModified(props.editorState.original.ornull?.get(), formState.get()));
  }, [formState.address.get(), formState.branch.get(), formState.rank.get(), formState.dutyPhone.get(), formState.dutyTitle.get(), formState.title.get(), formState.firstName.get(), formState.lastName.get(), formState.middleName.get(), formState.phone.get(), formState.title.get()]);

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
                isError={failsHookstateValidation(formState.firstName)}
                errorMessages={generateStringErrorMessages(formState.firstName)}
                required
              >
                <TextInput id="firstName" name="firstName" type="text"
                            value={formState.firstName.get() || ''}
                            error={failsHookstateValidation(formState.firstName)}
                            onChange={(event) => formState.firstName.set(event.target.value)}
                />
              </FormGroup>
            </div>
            <div>
              <FormGroup labelName="middleName" labelText="Middle Name"
                isError={failsHookstateValidation(formState.middleName)}
                errorMessages={generateStringErrorMessages(formState.middleName)}
              >
                <TextInput id="middleName" name="middleName" type="text"
                            value={formState?.middleName.get() || ''}
                            error={failsHookstateValidation(formState.middleName)}
                            onChange={(event) => formState.middleName.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <FormGroup labelName="lastName" labelText="Last Name"
                isError={failsHookstateValidation(formState.lastName)}
                errorMessages={generateStringErrorMessages(formState.lastName)}
                required
              >
                <TextInput id="lastName" name="lastName" type="text"
                            value={formState?.lastName.get() || ''}
                            error={failsHookstateValidation(formState.lastName)}
                            onChange={(event) => formState.lastName.set(event.target.value)}
                />
              </FormGroup>
            </div>
            <div>
              <FormGroup labelName="title" labelText="Title"
                isError={failsHookstateValidation(formState.title)}
                errorMessages={generateStringErrorMessages(formState.title)}
              >
                <TextInput id="title" name="title" type="text"
                            defaultValue={formState?.title.get() || ''}
                            error={failsHookstateValidation(formState.title)}
                            onChange={(event) => formState.title.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex">
            <div className="flex-grow-1">
              <FormGroup labelName="address" labelText="Address"
                isError={failsHookstateValidation(formState.address)}
                errorMessages={generateStringErrorMessages(formState.address)}
              >
                <TextInput id="address" name="address" type="text"
                            className="d-flex flex-grow-1"
                            defaultValue={formState?.address.get() || ''}
                            error={failsHookstateValidation(formState.address)}
                            onChange={(event) => formState.address.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <FormGroup labelName="phone" labelText="Phone"
                isError={failsHookstateValidation(formState.phone)}
                errorMessages={generateStringErrorMessages(formState.phone)}
              >
                <TextInput id="phone" name="phone" type="text"
                            defaultValue={formState?.phone.get() || ''}
                            error={failsHookstateValidation(formState.phone)}
                            onChange={(event) => formState.phone.set(event.target.value)}
                />
              </FormGroup>
            </div>
            <div>
              <FormGroup labelName="dutyPhone" labelText="Duty Phone"
                isError={failsHookstateValidation(formState.dutyPhone)}
                errorMessages={generateStringErrorMessages(formState.dutyPhone)}
              >
                <TextInput id="dutyPhone" name="dutyPhone" type="text"
                            defaultValue={formState?.dutyPhone.get() || ''}
                            error={failsHookstateValidation(formState.dutyPhone)}
                            onChange={(event) => formState.dutyPhone.set(event.target.value)}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <FormGroup labelName="dutyTitle" labelText="Duty Title"
                isError={failsHookstateValidation(formState.dutyTitle)}
                errorMessages={generateStringErrorMessages(formState.dutyTitle)}
              >
                <TextInput id="dutyTitle" name="dutyTitle" type="text"
                            defaultValue={formState?.dutyTitle.get() || ''}
                            error={failsHookstateValidation(formState.dutyTitle)}
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
                            disabled={rankState.promised}
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
                    isError={failsHookstateValidation(formState.rank)}
                    errorMessages={generateStringErrorMessages(formState.rank)}
                    required
                  >
                    {
                      rankState.promised ? 'loading ranks...' :
                        <Select id="rank" name="rank"
                                onChange={(event) => {
                                formState.rank.set(event.target.value);
                                }}
                                value={formState.get().rank}
                        >
                          {
                            formState.get().branch && rankState.get()[formState.get()?.branch ||
                                PersonDtoBranchEnum.Other]?.map(rank => (
                                  <option key={`${rank.branchType}-${rank.abbreviation}`} value={rank.abbreviation}>{rank.abbreviation}</option>
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

export const HeaderUserEditorWithLoading = withLoading<UserInfoFormProps>(HeaderUserEditor);
export default HeaderUserEditor;
