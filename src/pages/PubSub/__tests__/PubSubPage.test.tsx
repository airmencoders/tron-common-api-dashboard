import {MemoryRouter} from 'react-router-dom';
import {
  AppClientControllerApi,
  AppClientUserDtoResponseWrapped,
  DashboardUserControllerApi,
  DashboardUserDto,
  PersonDto,
  PrivilegeDto,
  SubscriberControllerApi,
  SubscriberDto,
  SubscriberDtoResponseWrapper,
  SubscriberDtoSubscribedEventEnum,
  UserInfoControllerApi,
  UserInfoControllerApiInterface,
  UserInfoDto
} from '../../../openapi';
import PubSubPage from '../PubSubPage';
import {render, screen, waitFor} from '@testing-library/react';
import {accessAppClientsState, useAppClientsState} from "../../../state/app-clients/app-clients-state";
import AppClientsService from "../../../state/app-clients/app-clients-service";
import {createState, State, StateMethodsDestroy} from "@hookstate/core";
import {AppClientFlat} from "../../../state/app-clients/app-client-flat";
import {AxiosResponse} from "axios";
import {accessAuthorizedUserState, useAuthorizedUserState} from "../../../state/authorized-user/authorized-user-state";
import AuthorizedUserService from "../../../state/authorized-user/authorized-user-service";
import {PrivilegeType} from "../../../state/privilege/privilege-type";
import PubSubService, {PubSubCollection} from "../../../state/pub-sub/pubsub-service";
import {useSubscriptionState} from "../../../state/pub-sub/pubsub-state";
import {UserInfoState, useUserInfoState} from "../../../state/user/user-info-state";
import UserInfoService from "../../../state/user/user-info-serivce";
import {CancellableDataRequest, makeCancellableDataRequest} from "../../../utils/cancellable-data-request";

jest.mock("../../../state/pub-sub/pubsub-state");
jest.mock("../../../state/authorized-user/authorized-user-state");
jest.mock("../../../state/app-clients/app-clients-state");
jest.mock("../../../state/user/user-info-state");

const initialAppClientState: AppClientFlat[] = [
  {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test App Client 1",
    appClientDeveloperEmails: [ 'jon@test.com' ],
    clusterUrl: '',
    orgRead: true
  },
  {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
    name: "Test App Client 2",
    appClientDeveloperEmails: [ 'sara@test.com' ],
    clusterUrl: '',
    orgRead: true
  }
];

const subscription: SubscriberDto = {
  id: 'some id',
  appClientUser: 'Test App Client 1',
  subscriberAddress: '/api/organization',
  subscribedEvent: SubscriberDtoSubscribedEventEnum.OrganizationChange,
  secret: '',
};

const subscriptionCollection: PubSubCollection = {
  id: 1,
  appClientUser: subscription.appClientUser,
  subscriberAddress: '',
  events: [ SubscriberDtoSubscribedEventEnum.OrganizationChange ],
  secret: '',
}

const axiosGetResponse: AxiosResponse = {
  data: { data: [subscription] },
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

const axiosGetAppClientsResponse: AxiosResponse = {
  data: { data: [initialAppClientState] },
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

const axiosGetExistingUserResponse: AxiosResponse = {
  data: { } as PersonDto,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

const axiosGetExistingUserInfoDtoResponse: AxiosResponse = {
  data: { email: 'test@person.com' } as UserInfoDto,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

const adminPrivilegeUser: DashboardUserDto = {
  id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
  email: 'test@person.com',
  privileges: [
    {
      'id': 2,
      'name': PrivilegeType.DASHBOARD_ADMIN
    }
  ]
};

const nonAdminPrivilegeUser: DashboardUserDto = {
  id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
  email: 'jon@test.com',
  privileges: [
    {
      'id': 2,
      'name': PrivilegeType.APP_CLIENT_DEVELOPER
    }
  ]
};

const getAdminPrivilegeUserResponse: AxiosResponse = {
  data: adminPrivilegeUser,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

let pubSubUserState: State<PubSubCollection[]> & StateMethodsDestroy;
let subscriberDtoState: State<SubscriberDto[]> & StateMethodsDestroy;
let appClientState: State<AppClientFlat[]> & StateMethodsDestroy;
let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
let appClientApi: AppClientControllerApi;
let pubSubApi: SubscriberControllerApi;
let dashboardUserApi: DashboardUserControllerApi;
let userInfoState: State<UserInfoState> & StateMethodsDestroy;
let userInfoApi: UserInfoControllerApiInterface;

beforeEach(() => {
  appClientState = createState<AppClientFlat[]>([...initialAppClientState]);
  privilegeState = createState<PrivilegeDto[]>([]);
  pubSubUserState = createState<PubSubCollection[]>([subscriptionCollection]);
  subscriberDtoState = createState<SubscriberDto[]>([subscription]);
  authorizedUserState = createState<DashboardUserDto | undefined>(adminPrivilegeUser);
  userInfoState = createState<UserInfoState>({});
  userInfoApi = new UserInfoControllerApi();
  appClientApi = new AppClientControllerApi();
  pubSubApi = new SubscriberControllerApi();
  dashboardUserApi = new DashboardUserControllerApi();

  appClientApi.getAppClientUsersWrapped = jest.fn(() => {
    return new Promise<AxiosResponse<AppClientUserDtoResponseWrapped>>(resolve => resolve(axiosGetAppClientsResponse));
  });

  pubSubApi.getAllSubscriptionsWrapped = jest.fn(() => {
    return new Promise<AxiosResponse<SubscriberDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
  });

  userInfoApi.getUserInfo = jest.fn(() => {
    return new Promise<AxiosResponse<UserInfoDto>>(resolve => resolve(axiosGetExistingUserInfoDtoResponse));
  });

  userInfoApi.getExistingPersonRecord = jest.fn(() => {
    return new Promise<AxiosResponse<PersonDto>>(resolve => resolve(axiosGetExistingUserResponse));
  });
});

afterEach(() => {
  appClientState.destroy();
  privilegeState.destroy();
  pubSubUserState.destroy();
  subscriberDtoState.destroy();
  authorizedUserState.destroy();
  userInfoState.destroy();
});

function mockAppClientState() {
  (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientState, appClientApi, privilegeState));
  (accessAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientState, appClientApi, privilegeState));
  jest.spyOn(useAppClientsState(), 'isPromised', 'get').mockImplementation(() => false);
  jest.spyOn(useAppClientsState(), 'appClients', 'get').mockImplementation(() => initialAppClientState);
}

function mockAuthorizedUserState() {
  (accessAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
  (useAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
  jest.spyOn(accessAuthorizedUserState(), 'isPromised', 'get').mockImplementation(() => false);
  jest.spyOn(useAuthorizedUserState(), 'isPromised', 'get').mockImplementation(() => false);
  dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
    return Promise.resolve(getAdminPrivilegeUserResponse);
  });
}

function mockPubSubUserState() {
  (useSubscriptionState as jest.Mock).mockReturnValue(new PubSubService(pubSubUserState, pubSubApi, subscriberDtoState));
  jest.spyOn(useSubscriptionState(), 'fetchAndStoreData').mockImplementation((): CancellableDataRequest<PubSubCollection[]> => {
    const appClientsRequest = accessAppClientsState().fetchAndStoreData();
    const cancellableRequest = makeCancellableDataRequest(appClientsRequest.cancelTokenSource, pubSubApi.getAllSubscriptionsWrapped.bind(pubSubApi));
    return {
      promise: Promise.resolve([subscriptionCollection]),
      cancelTokenSource: cancellableRequest.cancelTokenSource,
    }
  })
  jest.spyOn(useSubscriptionState(), 'isPromised', 'get').mockImplementation(() => false);
}

function mockUserInfoState() {
  (useUserInfoState as jest.Mock).mockReturnValue(new UserInfoService(userInfoState, userInfoApi));
  jest.spyOn(useUserInfoState(), 'isPromised', 'get').mockImplementation(() => false);
}

it('should render with add subscriber button visible for admin user', async () => {
  mockAppClientState();
  mockAuthorizedUserState();
  mockPubSubUserState();
  mockUserInfoState();

  const page = render(
    <MemoryRouter>
      <PubSubPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getAllByText('Pub Sub Subscribers')).toBeTruthy());
  expect(page.queryByText('Add Subscriber')).toBeVisible();
  expect(page.queryByText('Test App Client 1')).toBeVisible();
});

it('should not render add subscriber button for app client dev with no other app clients', async () => {
  authorizedUserState.set(nonAdminPrivilegeUser);
  mockAppClientState();
  mockAuthorizedUserState();
  mockPubSubUserState();
  mockUserInfoState();

  const page = render(
    <MemoryRouter>
      <PubSubPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getAllByText('Pub Sub Subscribers')).toBeTruthy());
  expect(page.queryByText('Add Subscriber')).not.toBeInTheDocument();
  expect(page.queryByText('Test App Client 1')).toBeVisible();
});

it('should render add subscriber button for app client dev with app clients available', async () => {
  pubSubUserState.set([]);  // this person would not see any existing subs since they don't have any they are a dev for
  authorizedUserState.set({...nonAdminPrivilegeUser, email: 'sara@test.com'});
  mockAppClientState();
  mockAuthorizedUserState();
  mockPubSubUserState();
  mockUserInfoState();

  const page = render(
    <MemoryRouter>
      <PubSubPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getAllByText('Pub Sub Subscribers')).toBeTruthy());
  expect(page.queryByText('Add Subscriber')).toBeInTheDocument();
  expect(page.queryByText('Test App Client 1')).not.toBeInTheDocument();
});
