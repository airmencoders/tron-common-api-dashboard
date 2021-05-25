import React from 'react';
import HeaderUserInfo from '../HeaderUserInfo';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { PersonDto, RankBranchTypeEnum, UserInfoDto } from '../../../openapi/models';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { PersonControllerApi, PersonControllerApiInterface, RankControllerApi, RankControllerApiInterface } from '../../../openapi';
import { RankStateModel } from '../../../state/person/rank-state-model';
import { usePersonState } from '../../../state/person/person-state';
import PersonService from '../../../state/person/person-service';

jest.mock('../../../state/person/person-state');

describe('Test HeaderUserInfo', () => {

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

  test('shows the HeaderUserInfo', async () => {
    const userInfo: UserInfoDto = {
      givenName: 'Test',
      familyName: 'User'
    }
    render(<HeaderUserInfo userInfo={userInfo} />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeTruthy()
    })
  });

  test('click shows userInfo dropdown', async () => {
    const userInfo: UserInfoDto = {
      givenName: 'Test',
      familyName: 'User',
      name: 'Test User'
    }

    render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy()
    })
  });

  test('userInfo dropdown should allow Edit Person Record', async () => {
    currentUserState.set({
      email: 'test@email.com'
    });

    const userInfo: UserInfoDto = {
      givenName: 'Test',
      familyName: 'User',
      name: 'Test User',
      email: 'test@email.com'
    }

    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    expect(element.getByText('Edit Person Record')).toBeInTheDocument();
  });

  test('should show Edit Person Record modal', async () => {
    const userEmail = 'test@email.com';
    const fName = 'Test';
    const lName = 'User';

    currentUserState.set({
      id: 'testID',
      firstName: fName,
      lastName: lName,
      email: userEmail
    });

    const userInfo: UserInfoDto = {
      givenName: fName,
      familyName: lName,
      name: `${fName} ${lName}`,
      email: userEmail
    };

    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(currentUserState.get().email).toBeDefined();
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    // Open the modal
    const editPerson = element.getByText('Edit Person Record');
    expect(editPerson).toBeInTheDocument();
    fireEvent.click(editPerson);

    // Find the modal by email
    await waitFor(() => {
      expect(screen.getByText(userEmail)).toBeTruthy();
    });

    // Modal update btn should be disabled
    const updateBtn = screen.getByText('Update');
    expect(updateBtn).toBeInTheDocument();
    expect(updateBtn).toBeDisabled();

    const firstNameInput = screen.getByDisplayValue(fName);
    expect(firstNameInput).toBeInTheDocument();
    fireEvent.change(firstNameInput, { target: { value: 'Test1' } });

    const closeBtn = screen.getByText('Cancel');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
  });

  test('userInfo dropdown should not allow Edit Person Record', async () => {
    const userInfo: UserInfoDto = {
      givenName: 'Test',
      familyName: 'User',
      name: 'Test User'
    }

    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    expect(element.findByText('Edit Person Record')).rejects;
  });
});
