/// <reference types="Cypress" />

import {apiHost, personApiBase, adminJwt, ssoXfcc } from "../support";
import { cleanup } from "../support/cleanup-helper";
import UtilityFunctions from '../support/utility-functions';

describe('Person Create API', () => {

  it('Should create a Person via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {}
        })
        .then((response) => {
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          })
        })
  });

  it('Should fail for invalid branch', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            branch: 'INVALID'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
        })
  });
  it('Should set rank to Unk if invalid', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            branch: 'USAF',
            rank: 'INVALID'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.body.rank).equal('Unk');
        });
  });

  it('Should fail for invalid dodid', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            dodid: '0'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
        })
  });

  it('Should fail for invalid email', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            branch: 'INVALID'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
        })
  });

  it('Should fail for invalid phone', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            phone: 'INVALID'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
        })
  });
  it('Should fail for invalid duty phone', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            dutyPhone: 'INVALID'
          },
          failOnStatusCode: false
        })
        .then((response) => {
          expect(response.status).to.be.gte(400)
              .and.lt(500);
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
            body,
            failOnStatusCode: false
          })
          .then(response => {
            expect(response.status).to.eq(400);
          })
    });
  });
})
