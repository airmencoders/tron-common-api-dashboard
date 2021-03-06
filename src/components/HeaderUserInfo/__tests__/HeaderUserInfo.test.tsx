import React from 'react';
import HeaderUserInfo from '../HeaderUserInfo';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { PersonDto, PersonDtoBranchEnum, RankBranchTypeEnum, UserInfoDto } from '../../../openapi/models';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import {
  PersonControllerApi,
  PersonControllerApiInterface,
  RankControllerApi,
  RankControllerApiInterface, UserInfoControllerApi,
  UserInfoControllerApiInterface
} from '../../../openapi';
import { RankStateModel } from '../../../state/person/rank-state-model';
import { usePersonState } from '../../../state/person/person-state';
import PersonService from '../../../state/person/person-service';
import { AxiosResponse } from 'axios';
import {UserInfoState, useUserInfoState} from '../../../state/user/user-info-state';
import UserInfoService from '../../../state/user/user-info-serivce';

jest.mock('../../../state/person/person-state');
jest.mock('../../../state/user/user-info-state');

describe('Test HeaderUserInfo', () => {

  let personState: State<PersonDto[]> & StateMethodsDestroy;
  let personApi: PersonControllerApiInterface;
  let rankState: State<RankStateModel> & StateMethodsDestroy;
  let rankApi: RankControllerApiInterface;

  let userInfo: UserInfoDto;
  let personDtoResponse: AxiosResponse<PersonDto>;

  let userInfoState: State<UserInfoState> & StateMethodsDestroy;
  let userInfoApi: UserInfoControllerApiInterface;

  function mockPersonService() {
    (usePersonState as jest.Mock).mockReturnValue(new PersonService(personState, personApi, rankState, rankApi));
  }

  function mockUserInfoService() {
    (useUserInfoState as jest.Mock).mockReturnValue(new UserInfoService(userInfoState, userInfoApi));
  }

  beforeEach(() => {
    personState = createState<PersonDto[]>([]);
    personApi = new PersonControllerApi();

    personApi.findPersonBy = jest.fn(() => {
      return Promise.resolve(personDtoResponse);
    });

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

    userInfoState = createState<UserInfoState>({});
    userInfoApi = new UserInfoControllerApi();

    userInfoApi.getExistingPersonRecord = jest.fn(() => {
      return Promise.resolve(personDtoResponse);
    });

    mockUserInfoService();

    userInfo = {
      givenName: 'Test',
      familyName: 'User',
      name: 'Test User',
      email: 'test@email.com'
    };

    personDtoResponse = {
      data: {
        id: 'TEST ID',
        firstName: userInfo.givenName,
        lastName: userInfo.familyName,
        email: userInfo.email,
        rank: 'CIV',
        branch: PersonDtoBranchEnum.Other
      },
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    };
  });

  afterEach(() => {
    personState.destroy();
    rankState.destroy();
  });

  test('shows the HeaderUserInfo', async () => {
    render(<HeaderUserInfo userInfo={userInfo} />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeTruthy()
    })
  });

  test('click shows userInfo dropdown', async () => {
    render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy()
    })
  });

  test('userInfo dropdown should allow Edit Person Record', async () => {
    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    expect(element.getByText('Edit Associated Record')).toBeInTheDocument();
  });

  test('should show Edit Person Record modal', async () => {
    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText(userInfo.name!)).toBeTruthy();
    });

    // Open the modal
    const editPerson = element.getByText('Edit Associated Record');
    expect(editPerson).toBeInTheDocument();
    fireEvent.click(editPerson);

    // Find the modal by email
    await waitFor(() => {
      expect(screen.getByText(userInfo.email!)).toBeTruthy();
    });

    // Modal update btn should be disabled
    const updateBtn = screen.getByText('Update');
    expect(updateBtn).toBeInTheDocument();
    expect(updateBtn).toBeDisabled();

    // Try to change one input to enable submit btn
    const firstNameInput = screen.getByDisplayValue(userInfo.givenName!);
    expect(firstNameInput).toBeInTheDocument();
    fireEvent.change(firstNameInput, { target: { value: 'Test1' } });
    expect(firstNameInput).toHaveValue('Test1');

    await waitFor(
      () => expect(updateBtn).not.toBeDisabled()
    );

    // Submit the modal
    // Fail first to test
    const selfUpdateResponse = {
      ...personDtoResponse
    };

    personApi.selfUpdatePerson = jest.fn(() => {
      return Promise.reject(new Error('failed'));
    });
    fireEvent.click(updateBtn);
    await waitFor(
      () => expect(screen.getByText(new RegExp('failed'))).toBeInTheDocument()
    );

    // Send successful
    selfUpdateResponse.data.firstName = 'Test2';
    personApi.selfUpdatePerson = jest.fn(() => {
      return Promise.resolve(selfUpdateResponse);
    });

    // Change field again to enable submit button
    fireEvent.change(firstNameInput, { target: { value: 'Test2' } });
    expect(firstNameInput).toHaveValue('Test2');

    await waitFor(
      () => expect(updateBtn).not.toBeDisabled()
    );

    fireEvent.click(updateBtn);
    expect(personApi.selfUpdatePerson).toHaveBeenCalledTimes(1);
    await waitFor(
      () => expect(updateBtn).not.toBeInTheDocument()
    );
  });

  test('userInfo dropdown should not allow Edit Person Record', async () => {
    userInfoApi.getExistingPersonRecord = jest.fn(() => {
      return Promise.reject(new Error('failed'));
    });

    const element = render(<HeaderUserInfo userInfo={userInfo} />);
    const dropdownToggle = screen.getByText('TU');
    fireEvent.click(dropdownToggle);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    await expect(element.findByText('Edit Associated Record')).rejects.toBeDefined();
  });
});
