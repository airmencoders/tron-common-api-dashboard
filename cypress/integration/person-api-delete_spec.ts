/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import { apiHost, appClientApiHost, personApiBase, adminJwt, ssoXfcc, nonAdminJwt, appClientTesterXfcc } from "../support";
import UtilityFunctions from '../support/utility-functions';

describe('Person Delete API', () => {

  it.skip('Should allow an authorized App Client to Delete a Person', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_DELETE'])
        .then((appClientId: string) => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}`,
                headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com` }
              })
              .then((resp) => {
                return cy.request({
                  method: 'DELETE',
                  url: `${appClientApiHost}${personApiBase}/${resp.body.id}`,
                  headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
                  failOnStatusCode: false
                })
              })
              .then((resp) => {
                expect(resp.status).to.equal(204);
              })
        });
  });
})
