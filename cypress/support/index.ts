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

export const host = Cypress.env('INTEGRATION_TEST_HOST');
export const apiBase = '/api/v2';
export const orgApiBase = `${apiBase}/organization`;
export const personApiBase = `${apiBase}/person`;
export const scratchAppApiBase = `${apiBase}/scratch`;
export const dashboardUserApiBase = `${apiBase}/dashboard-users`;
export const pastLogfileApi = `/api/v1/logfile`;
export const logfileActuatorApi = `/api/actuator/logfile`;
export const subscriptionsApiBase = `${apiBase}/subscriptions`;

// Alternatively you can use CommonJS syntax:
// require('./commands')
