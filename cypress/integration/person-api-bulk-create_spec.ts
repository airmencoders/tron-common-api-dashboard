/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, personApiBase, adminJwt, ssoXfcc } from "../support";
import {PersonDto} from '../../src/openapi';
import { cleanup } from '../support/cleanup-helper';

describe('Person API Bulk Create', () => {

  it('Should allow an authorized App Client to bulk create people', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_CREATE'])
        .then(() => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}/persons`,
                headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                body: [{}, {}],
                failOnStatusCode: false
              })
              .then((resp) => {
                expect(resp.status).to.equal(201);
                const createdPeople = resp.body?.data;
                cy.wrap(createdPeople).each( (created: PersonDto) => {
                  cy.request({
                    method: 'DELETE',
                    url: `${apiHost}${personApiBase}/${created.id}`,
                    headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                    failOnStatusCode: false
                  })
                  .then((resp) => {
                    expect(resp.status).to.equal(204);
                  })
                })
              })
        });
  });

  it('Should not allow partial updates', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_CREATE'])
        .then(() => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}/persons`,
                headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                body: [{ 'firstName': 'createdWithBulk'}, {'badField': 'bad'} ],
                failOnStatusCode: false
              })
              .then((resp) => {
                expect(resp.status).to.equal(400);
              })
        });
  });

  it('Should reject when all updates contain bad fields', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_CREATE'])
        .then(() => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}/persons`,
                headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                body: [{ 'badField': 'bad'}, {'badField': 'bad'} ],
                failOnStatusCode: false
              })
              .then((resp) => {
                expect(resp.status).to.equal(400);
                if (resp.status < 400) {
                  const createdPeople = resp.body?.data;
                  cy.wrap(createdPeople).each( (created: PersonDto) => {
                    cy.request({
                      method: 'DELETE',
                      url: `${apiHost}${personApiBase}/${created.id}`,
                      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
                      failOnStatusCode: false
                    })
                        .then((resp) => {
                          expect(resp.status).to.equal(204);
                        })
                  })
                }
              })
        });
  });
})
