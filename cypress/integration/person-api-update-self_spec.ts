/// <reference types="Cypress" />

import {apiHost, appClientApiHost, appClientDashboardApiHost, personApiBase, userInfoApiBase, adminJwt, ssoXfcc, nonAdminJwt } from "../support";
import UtilityFunctions from '../support/utility-functions';
import AppClientSetupFunctions from '../support/app-client-setup-functions';
import { cleanup, personIdsToDelete } from "../support/cleanup-helper";

describe('Person can update self from dashboard', () => {
  const userBaseUrl = appClientApiHost;
  const adminBaseUrl = apiHost;

  it('should allow a person to update self regardless of permissions', () => {
    const updatePersonEmail = `jj@gmail.com`;
    cy
          // remove existing person with updatePersonEmail
        .request({
          method: 'POST',
          url: `${adminBaseUrl}${personApiBase}/find`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
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
              url: `${adminBaseUrl}${personApiBase}/${resp.body.id}`,
              headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            });
          }
          return;
        })
        .request({
          method: 'POST',
          url: `${adminBaseUrl}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {firstName: UtilityFunctions.generateRandomString(),
            email: updatePersonEmail
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientDashboardApiHost}${userInfoApiBase}/existing-person`,
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": ssoXfcc }
              })
              .then((resp) => {
                return cy
                    .request({
                      method: 'PUT',
                      url: `${appClientDashboardApiHost}${personApiBase}/self`,
                      headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": ssoXfcc },
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
