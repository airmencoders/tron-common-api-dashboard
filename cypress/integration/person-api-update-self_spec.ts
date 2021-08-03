/// <reference types="Cypress" />

import {apiHost, appClientApiHost, personApiBase, userInfoApiBase} from '../support';
import UtilityFunctions from '../support/utility-functions';
import AppClientSetupFunctions from '../support/app-client-setup-functions';

describe('Person update self', () => {
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
          url: `${userBaseUrl}${personApiBase}`,
          body: {
            email: updatePersonEmail
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          return cy
              .request({
                method: 'GET',
                url: `${userBaseUrl}${userInfoApiBase}/existing-person`
              })
              .then((resp) => {
                return cy
                    .request({
                      method: 'PUT',
                      url: `${userBaseUrl}${personApiBase}/self/${resp.body?.id}`,
                      body: {
                        ... resp.body,
                        firstName: 'NewFirst'
                      }
                    });
              })
        })
        .then((resp) => {
          expect(resp.body.firstName).to.equal('NewFirst');
        })
  })
})
