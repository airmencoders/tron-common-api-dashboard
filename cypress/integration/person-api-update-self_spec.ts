/// <reference types="Cypress" />

import {apiHost, appClientApiHost, appClientDashboardApiHost, personApiBase, userInfoApiBase} from '../support';
import UtilityFunctions from '../support/utility-functions';
import AppClientSetupFunctions from '../support/app-client-setup-functions';

describe('Person can update self from app client', () => {
  const userBaseUrl = appClientApiHost;
  const adminBaseUrl = apiHost;

  it('should allow a person to update self regardless of permissions', () => {
    const updatePersonEmail = `jj@gmail.com`;
    cy
          // remove existing person with updatePersonEmail
        .request({
          method: 'POST',
          url: `${adminBaseUrl}${personApiBase}/find`,
          body: {
            findType: 'EMAIL',
            value: updatePersonEmail
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          if (resp.status === 200) {
            return cy.request({
              method: 'DELETE',
              url: `${adminBaseUrl}${personApiBase}/${resp.body.id}`
            });
          }
          return;
        })
        .request({
          method: 'POST',
          url: `${adminBaseUrl}${personApiBase}`,
          body: {
            email: updatePersonEmail
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientDashboardApiHost}${userInfoApiBase}/existing-person`
              })
              .then((resp) => {
                return cy
                    .request({
                      method: 'PUT',
                      url: `${appClientDashboardApiHost}${personApiBase}/self`,
                      body: {
                        ... resp.body,
                        firstName: 'NewFirst'
                      },
                      failOnStatusCode: false
                    });
              })
        })
        .then((resp) => {
          expect(resp.body.firstName).to.equal('NewFirst');
        })
  })
})
