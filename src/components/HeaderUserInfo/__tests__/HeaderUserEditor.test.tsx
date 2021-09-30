import React from 'react';
import { UserEditorState } from '../HeaderUserInfo';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { PersonDto, PersonDtoBranchEnum, Rank, RankBranchTypeEnum } from '../../../openapi/models';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { PersonControllerApi, PersonControllerApiInterface, RankControllerApi, RankControllerApiInterface } from '../../../openapi';
import { RankStateModel } from '../../../state/person/rank-state-model';
import { usePersonState } from '../../../state/person/person-state';
import PersonService from '../../../state/person/person-service';
import HeaderUserEditor from '../HeaderUserEditor';

jest.mock('../../../state/person/person-state');

describe('Test HeaderUserInfo', () => {
  let personState: State<PersonDto[]> & StateMethodsDestroy;
  let personApi: PersonControllerApiInterface;
  let rankState: State<RankStateModel> & StateMethodsDestroy;
  let rankApi: RankControllerApiInterface;

  let userEditorState: State<UserEditorState> & StateMethodsDestroy;

  function mockPersonService() {
    (usePersonState as jest.Mock).mockReturnValue(new PersonService(personState, personApi, rankState, rankApi));
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

    mockPersonService();

    userEditorState = createState<UserEditorState>({
      isOpen: false,
      currentUserState: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@user.com',
        rank: 'CIV',
        branch: PersonDtoBranchEnum.Other
      },
      errorMessage: '',
      disableSubmit: false,
      isLoading: false,
      isLoadingInitial: false
    });
  });

  afterEach(() => {
    personState.destroy();
    rankState.destroy();
    userEditorState.destroy();
  });

  it('renders HeaderUserEditor', async () => {
    render(<HeaderUserEditor editorState={userEditorState} userInitials="TU" />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeTruthy()
    });
  });

  it(`should set formState for First Name`, async () => {
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
    const ranks: Rank[] = [
      {
        abbreviation: 'CIV',
        name: 'CIV',
        branchType: RankBranchTypeEnum.Other
      },
      {
        abbreviation: 'CIV',
        name: 'CIV',
        branchType: RankBranchTypeEnum.Usaf
      }
    ];

    rankApi.getRanks1 = jest.fn(() => {
      return Promise.resolve({
        data: {
          data: ranks
        },
        status: 200,
        statusText: 'OK',
        config: {},
        headers: {}
      });
    });

    const form = render(
      <HeaderUserEditor
        editorState={userEditorState}
        userInitials="TU"
      />
    );

    // Try to change branch
    const branchInput = form.getByLabelText('Branch');
    await waitFor(
      () => expect(branchInput).not.toBeDisabled()
    );

    fireEvent.change(branchInput, { target: { value: 'USAF' } });
    await waitFor(
      () => expect(branchInput).toHaveValue('USAF')
    );

    // Try to change rank
    const rankInput = form.getByLabelText('Rank');
    fireEvent.change(rankInput, { target: { value: 'CIV' } });

    await waitFor(
      () => expect((rankInput as HTMLInputElement).value).toBe('CIV')
    );

  });
});
