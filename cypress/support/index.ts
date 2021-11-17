// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './cleanup-helper';
import jwt from 'jwt-simple';

export const host = Cypress.env('INTEGRATION_TEST_HOST');
export const apiHost = Cypress.env('ADMIN_API_HOST') ?? 'http://localhost:9000';
export const appClientApiHost = Cypress.env('APP_CLIENT_API_HOST') ?? 'http://localhost:9100';
export const appClientDashboardApiHost = Cypress.env('APP_CLIENT_DASHBOARD_API_HOST') ?? 'http://localhost:9200';
export const apiBase = '/api/v2';
export const orgApiBase = `${apiBase}/organization`;
export const personApiBase = `${apiBase}/person`;
export const appClientApiBase = `${apiBase}/app-client`;
export const privilegeApiBase = `${apiBase}/privilege`;
export const scratchAppApiBase = `${apiBase}/scratch`;
export const dashboardUserApiBase = `${apiBase}/dashboard-users`;
export const userInfoApiBase = `${apiBase}/userinfo`;
export const pastLogfileApi = `/api/v1/logfile`;
export const logfileActuatorApi = `/api/actuator/logfile`;
export const subscriptionsApiBase = `${apiBase}/subscriptions`;
export const documentSpaceApiBase = `${apiBase}/document-space`;

export const organizationUrl = `${apiHost}${orgApiBase}`;
export const appClientUrl = `${apiHost}${appClientApiBase}`;
export const personUrl = `${apiHost}${personApiBase}`;

export const appClientHostAppClientUrl = `${appClientApiHost}${appClientApiBase}`;
export const appClientHostOrganizationUrl = `${appClientApiHost}${orgApiBase}`;

export const documentSpaceUrl = `${apiHost}${documentSpaceApiBase}`;
export const documentSpaceDashboardUrl = `${host}/document-space`;

export const agGridFilterDebounce = 500;

const word = 'jwtToken';
const type = 'HS256';

export const adminJwt = "Bearer " + jwt.encode({
  "iss": "istio",
  "email": "czell@revacomm.com"
}, word, type);
export const ssoXfcc = "By=spiffe://cluster/ns/istio-system/sa/defaultFAKE_H=12345Subject=\"\";URI=spiffe://cluster.local/ns/istio-system/sa/default";
export const nonAdminJwt = "Bearer " + jwt.encode({
  "iss": "istio",
  "email": "jj@gmail.com"
}, word, type);
export const appClientTesterXfcc = "By=spiffe://cluster/ns/app-client-tester/sa/defaultFAKE_H=12345Subject=\"\";URI=spiffe://cluster.local/ns/app-client-tester/sa/default"; 
