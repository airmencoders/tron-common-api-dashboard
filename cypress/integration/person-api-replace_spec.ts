/// <reference types="Cypress" />

import {apiHost, personApiBase, adminJwt, ssoXfcc } from "../support";
import { cleanup, personIdsToDelete } from "../support/cleanup-helper";
import UtilityFunctions from '../support/utility-functions';

describe('Person Put API', () => {

  it('Should replace a Person via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com` }
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              firstName: UtilityFunctions.generateRandomString(),
              email: `${UtilityFunctions.generateRandomString()}@testemail.com`
            }
          })
        })
        .then((response) => {
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        })
  });

  it('Should fail for invalid field lengths', () => {
    // firstName/middleName/lastName/title/address/dutyTitle
    const fieldArray = [
        'firstName',
        'middleName',
        'lastName',
        'title',
        'address',
        'dutyTitle'
    ];

    cy.wrap(fieldArray).each((field : string) => {
      const body: {[key: string]: any} = {};
      body[field] = UtilityFunctions.randomStringOfLength(260);
      cy
          .request({
            method: 'POST',
            url: `${apiHost}${personApiBase}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {},
            failOnStatusCode: false
          })
          .then((response) => {
            return cy.request({
              method: 'PUT',
              url: `${apiHost}${personApiBase}/${response.body.id}`,
              headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
              body: {
                id: response.body.id,
                ...body
              },
              failOnStatusCode: false
            })
          })
          .then(response => {
            expect(response.status).to.be.gte(400)
                .and.lt(500);
            return response;
          })
          .then((response) => {
            const requestBody = JSON.parse(response.allRequestResponses[0]?.['Request Body']);
            cy.request({
              method: 'DELETE',
              url: `${apiHost}${personApiBase}/${requestBody.id}`,
              headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            })
          })
    });
  });
  it('Should fail for invalid branch', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {},
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              branch: 'INVALID'
            },
            failOnStatusCode: false
          })
        })
        .then(response => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
          return response;
        })
        .then((response) => {
          const requestBody = JSON.parse(response.allRequestResponses[0]?.['Request Body']);
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${requestBody.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        })
  });
  it('Should set rank to Unk if invalid', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com` },
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              branch: 'USAF',
              rank: 'INVALID'
            },
            failOnStatusCode: false
          })
        })
        .then((response) => {
          expect(response.body.rank).equal('Unk');
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        });

  });

  it('Should fail for invalid dodid', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {},
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`,
              dodid: '0'
            },
            failOnStatusCode: false
          })
        })
        .then(response => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
          return response;
        })
        .then((response) => {
          const requestBody = JSON.parse(response.allRequestResponses[0]?.['Request Body']);
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${requestBody.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        })

  });

  it('Should fail for invalid email', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
          },
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              branch: 'INVALID'
            },
            failOnStatusCode: false
          })
        })
        .then(response => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
          return response;
        })
  });

  it('Should fail for invalid phone', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
          },
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              phone: 'INVALID'
            },
            failOnStatusCode: false
          })
        })
        .then(response => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
          return response;
        });
  });
  it('Should fail for invalid duty phone', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: { firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
          },
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
              dutyPhone: 'INVALID'
            },
            failOnStatusCode: false
          })
        })
        .then(response => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
          return response;
        })
  });
})
