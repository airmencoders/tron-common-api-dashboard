import React from 'react';
import HeaderUserInfo, { UserEditorState } from '../HeaderUserInfo';
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import { PersonDto, PersonDtoBranchEnum, RankBranchTypeEnum, UserInfoDto } from '../../../openapi/models';
import { createState, State, StateMethodsDestroy, useHookstate } from '@hookstate/core';
import { PersonControllerApi, PersonControllerApiInterface, RankControllerApi, RankControllerApiInterface } from '../../../openapi';
import { RankStateModel } from '../../../state/person/rank-state-model';
import { usePersonState } from '../../../state/person/person-state';
import PersonService from '../../../state/person/person-service';
import HeaderUserEditor from '../HeaderUserEditor';

jest.mock('../../../state/person/person-state');

describe('Test HeaderUserInfo', () => {
  const person: PersonDto = {
    email: 'test@user.com',
    firstName: 'Test',
    lastName: 'User',
    middleName: 'TestMiddleName',
    title: 'TestTitle',
    address: 'TestAddress',
    phone: '9998888888',
    dutyPhone: '1112223333',
    dutyTitle: 'TestDutyTitle',
    branch: PersonDtoBranchEnum.Other,
    rank: 'CIV'
  };

  let personState: State<PersonDto[]> & StateMethodsDestroy;
  let personApi: PersonControllerApiInterface;
  let rankState: State<RankStateModel> & StateMethodsDestroy;
  let rankApi: RankControllerApiInterface;
  let currentUserState: State<PersonDto> & StateMethodsDestroy;

  function mockPersonService() {
    (usePersonState as jest.Mock).mockReturnValue(new PersonService(personState, personApi, rankState, rankApi, currentUserState));
  }

  beforeEach(() => {
    personState = createState<PersonDto[]>([]);
    personApi = new PersonControllerApi();
    rankState = createState<RankStateModel>({
      OTHER: [
        { abbreviation: "CIV", name: "Civilian", payGrade: "GS", branchType: RankBranchTypeEnum.Other }
      ],
      USA: [],
      USAF: [
        { abbreviation: "CIV", name: "Civilian", payGrade: "GS", branchType: RankBranchTypeEnum.Usaf }
      ],
      USMC: [],
      USN: [],
      USSF: [],
      USCG: [],
    });
    rankApi = new RankControllerApi();
    currentUserState = createState<PersonDto>({});

    mockPersonService();
  });

  afterEach(() => {
    personState.destroy();
    rankState.destroy();
    currentUserState.destroy();
  });

  test('renders HeaderUserEditor', async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    render(<HeaderUserEditor editorState={userEditorState} userInitials="TU" />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeTruthy()
    });
  });

  it(`should set formState for First Name`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('First Name', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'fname' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('fname')
    );
  });

  it(`should set formState for Middle Name`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Middle Name', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'mname' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('mname')
    );
  });

  it(`should set formState for Last Name`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Last Name', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'lname' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('lname')
    );
  });

  it(`should set formState for Title`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Title', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'title' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('title')
    );
  });

  it(`should set formState for Address`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Address', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'address' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('address')
    );
  });

  it(`should set formState for Phone`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Phone', { selector: 'input' });
    fireEvent.change(input, { target: { value: '1112223333' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('1112223333')
    );
  });

  it(`should set formState for Duty Phone`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Duty Phone', { selector: 'input' });
    fireEvent.change(input, { target: { value: '2223334444' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('2223334444')
    );
  });

  it(`should set formState for Duty Title`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    const input = form.getByLabelText('Duty Title', { selector: 'input' });
    fireEvent.change(input, { target: { value: 'DT' } });
    await waitFor(
      () => expect((input as HTMLInputElement).value).toBe('DT')
    );
  });

  it(`should set formState for Branch`, async () => {
    currentUserState.set({
      ...person
    });

    const userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: currentUserState,
      errorMessage: '',
      disableSubmit: false,
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    // const input = form.getByLabelText('Branch');
    // act(() => {
    //   fireEvent.change(input, { target: { value: 'USAF' } });
    // });
    // await waitFor(
    //   () => expect((input as HTMLInputElement).value).toBe('USAF')
    // );
  });
});
