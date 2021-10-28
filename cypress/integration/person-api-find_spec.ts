/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, appClientApiHost, personApiBase, adminJwt, ssoXfcc, nonAdminJwt, appClientTesterXfcc } from "../support";
import PersonSetupFunctions from '../support/person-setup-functions';
import { cleanup } from '../support/cleanup-helper';
import UtilityFunctions from '../support/utility-functions';

describe.skip('Person Find API', () => {

  it('Should allow an authorized app client to find a person record by email', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ'])
        .then((resp) => {
          return PersonSetupFunctions.addTestUser({
            firstName: UtilityFunctions.generateRandomString(),
            lastName: UtilityFunctions.generateRandomString(),
            email: PersonSetupFunctions.USER_EMAIL
          });
        })
        .then((resp) => {
          return cy
              .request({
                method: 'POST',
                url: `${appClientApiHost}${personApiBase}/find`,
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
                body: {
                  findType: 'EMAIL',
                  value: PersonSetupFunctions.USER_EMAIL
                }
              });
        })
        .then((resp) => {
          expect(resp.status).to.equal(200);
          expect(resp.body.email).to.equal(PersonSetupFunctions.USER_EMAIL);
        });
  });

  it('Should allow an authorized app client to find a person record by dodid', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ'])
        .then((resp) => {
          return PersonSetupFunctions.addTestUser({
            firstName: UtilityFunctions.generateRandomString(),
            lastName: UtilityFunctions.generateRandomString(),
            email: `${UtilityFunctions.generateRandomString()}@testp1.mil`,
            dodid: PersonSetupFunctions.USER_DODID
          });
        })
        .then((resp) => {
          return cy
              .request({
                method: 'POST',
                url: `${appClientApiHost}${personApiBase}/find`,
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
                body: {
                  findType: 'DODID',
                  value: PersonSetupFunctions.USER_DODID
                }
              });
        })
        .then((resp) => {
          expect(resp.status).to.equal(200);
          expect(resp.body.dodid).to.equal(PersonSetupFunctions.USER_DODID);
        });
  });
});
