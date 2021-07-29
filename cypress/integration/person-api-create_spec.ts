/// <reference types="Cypress" />

import {personApiBase} from '../support';
import UtilityFunctions from '../support/utility-functions';

describe('Person Create API', () => {

  it('Should create a Person via API', () => {
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
          body: {}
        })
        .then((response) => {
          cy.request({
            method: 'DELETE',
            url: `${baseUrl}${personApiBase}/${response.body.id}`
          })
        })
  });

  it('Should fail for invalid branch', () => {
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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
    const baseUrl = 'http://localhost:9000';
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
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

    const baseUrl = 'http://localhost:9000';
    cy.wrap(fieldArray).each((field : string) => {
      const body: {[key: string]: any} = {};
      body[field] = UtilityFunctions.randomStringOfLength(260, 'a');
      cy
          .request({
            method: 'POST',
            url: `${baseUrl}${personApiBase}`,
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
