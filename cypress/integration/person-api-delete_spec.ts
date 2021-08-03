/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, appClientApiHost, personApiBase} from '../support';

describe('Person Delete API', () => {

  it('Should allow an authorized App Client to Delete a Person', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_DELETE'])
        .then((appClientId: string) => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}`,
                body: {}
              })
              .then((resp) => {
                return cy.request({
                  method: 'DELETE',
                  url: `${appClientApiHost}${personApiBase}/${resp.body.id}`,
                  failOnStatusCode: false
                })
              })
              .then((resp) => {
                expect(resp.status).to.equal(204);
              })
        });
  });
})
