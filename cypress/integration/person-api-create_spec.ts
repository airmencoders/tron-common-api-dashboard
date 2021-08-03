/// <reference types="Cypress" />

import {apiBase, apiHost, personApiBase} from '../support';
import UtilityFunctions from '../support/utility-functions';

describe('Person Create API', () => {

  it('Should create a Person via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
          body: {}
        })
        .then((response) => {
          cy.request({
            method: 'DELETE',
            url: `${apiHost}${personApiBase}/${response.body.id}`
          })
        })
  });

  it('Should fail for invalid branch', () => {
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}`,
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
            body,
            failOnStatusCode: false
          })
          .then(response => {
            expect(response.status).to.be.gt(400)
                .and.lt(500);
          })
    });
  });
})
