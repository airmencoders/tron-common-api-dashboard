/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, appClientApiHost, personApiBase} from '../support';
import PersonSetupFunctions from '../support/person-setup-functions';

describe('Person Find API', () => {

  it('Should allow an authorized app client to find a person record by email', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ'])
        .then((resp) => {
          return PersonSetupFunctions.addTestUser({
            email: PersonSetupFunctions.USER_EMAIL
          });
        })
        .then((resp) => {
          return cy
              .request({
                method: 'POST',
                url: `${appClientApiHost}${personApiBase}/find`,
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
            dodid: PersonSetupFunctions.USER_DODID
          });
        })
        .then((resp) => {
          return cy
              .request({
                method: 'POST',
                url: `${appClientApiHost}${personApiBase}/find`,
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
