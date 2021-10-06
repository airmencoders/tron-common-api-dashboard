/// <reference types="Cypress" />

import {apiHost, orgApiBase, personApiBase, adminJwt, ssoXfcc } from "../support";
import { cleanup, personIdsToDelete } from "../support/cleanup-helper";
import UtilityFunctions from '../support/utility-functions';

describe('Person Put API', () => {

  it('Should update a Person First Name via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`}
        })
        .then((response) => {
          return cy.request({
            method: 'PATCH',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: {
              "Content-Type": "application/json-patch+json",
              "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc
            },
            body:
            [
              { op: 'replace', path: '/firstName', value: 'First Name' }
            ]
          })
        })
        .then((response) => {
          expect(response?.body?.firstName).to.equal('First Name');
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        })
  });

  it('Should remove a Person First Name through PATCH request via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            firstName: 'FirstName',
            email: `${UtilityFunctions.generateRandomString()}@testemail.com`
          }
        })
        .then((response) => {
          return cy.request({
            method: 'PATCH',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: {
              "Content-Type": "application/json-patch+json",
              "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc
            },
            body:
            [
              { op: 'remove', path: '/firstName'}
            ]
          })
        })
        .then((response) => {
          expect(response?.body?.firstName).to.be.null;
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        });
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
      const newValue = UtilityFunctions.randomStringOfLength(260);
      const uuid = UtilityFunctions.uuidv4();
      cy
          .request({
            method: 'POST',
            url: `${apiHost}${personApiBase}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: uuid,
              firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
            },
            failOnStatusCode: false
          })
          .then((response) => {
            return cy.request({
              method: 'PATCH',
              url: `${apiHost}${personApiBase}/${response.body.id}`,
              headers: {
                "Content-Type": "application/json-patch+json",
                "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc
              },
              body: [{
                op: 'replace', path: `/${field}`, value: newValue
              }],
              failOnStatusCode: false
            })
          })
          .then(response => {
            expect(response.status).to.eq(400)
            return response;
          })
          .then((response) => {
            cy.request({
              method: 'DELETE',
              url: `${apiHost}${personApiBase}/${uuid}`,
              headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            })
          })
    });
  });

  it('Should set the primary organization through PATCH request via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            firstName: UtilityFunctions.generateRandomString(),
            email: `${UtilityFunctions.generateRandomString()}@email.com`
          }
        })
        .then((personCreateResp) => {
          return cy.request({
            method: 'POST',
            url: `${apiHost}${orgApiBase}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              name: UtilityFunctions.generateRandomString(),
              orgType: 'SQUADRON',
              branchType: 'USAF',
              members: [],
              subordinateOrganizations: []
            }
          })
          .then((orgCreateResp) => {
            return {
              person: personCreateResp.body,
              org: orgCreateResp.body
            }
          })
        })
        .then((entities) => {
          return cy.request({
            method: 'PATCH',
            url: `${apiHost}${personApiBase}/${entities.person.id}`,
            headers: {
              "Content-Type": "application/json-patch+json",
              "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc
            },
            body:
                [
                  { op: 'replace', path: '/primaryOrganizationId', value: entities.org.id }
                ]
          })
          .then((resp) => {
            expect(resp?.body?.primaryOrganizationId).to.equal(entities.org.id);
            return entities;
          })
        })
        .then((entities) => {
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${orgApiBase}/${entities.org.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
          .request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${entities.person.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        });
  });

  it('Should fail for invalid branch', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`},
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
              rank: 'INVALID',
              firstName: UtilityFunctions.generateRandomString(), 
              email: `${UtilityFunctions.generateRandomString()}@testemail.com`
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
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`},
          failOnStatusCode: false
        })
        .then((response) => {
          return cy.request({
            method: 'PUT',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              id: response.body.id,
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
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
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
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
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
          body: {firstName: UtilityFunctions.generateRandomString(), email: `${UtilityFunctions.generateRandomString()}@testemail.com`
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
