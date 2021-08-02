/// <reference types="Cypress" />

import {orgApiBase, personApiBase} from '../support';
import UtilityFunctions from '../support/utility-functions';

describe('Person Put API', () => {
  const baseUrl = 'http://localhost:9000';

  it('Should update a Person First Name via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
          body: {}
        })
        .then((response) => {
          return cy.request({
            method: 'PATCH',
            url: `${baseUrl}${personApiBase}/${response.body.id}`,
            headers: {
              "Content-Type": "application/json-patch+json"
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
            url: `${baseUrl}${personApiBase}/${response.body.id}`
          })
        })
  });

  it('Should remove a Person First Name through PATCH request via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
          body: {
            firstName: 'FirstName'
          }
        })
        .then((response) => {
          return cy.request({
            method: 'PATCH',
            url: `${baseUrl}${personApiBase}/${response.body.id}`,
            headers: {
              "Content-Type": "application/json-patch+json"
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
            url: `${baseUrl}${personApiBase}/${response.body.id}`
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
      cy
          .request({
            method: 'POST',
            url: `${baseUrl}${personApiBase}`,
            body: {},
            failOnStatusCode: false
          })
          .then((response) => {
            return cy.request({
              method: 'PATCH',
              url: `${baseUrl}${personApiBase}/${response.body.id}`,
              headers: {
                "Content-Type": "application/json-patch+json"
              },
              body: [{
                op: 'replace', path: `/${field}`, value: newValue
              }],
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
              url: `${baseUrl}${personApiBase}/${requestBody.id}`
            })
          })
    });
  });

  it('Should set the primary organization through PATCH request via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
          body: {
            email: `${UtilityFunctions.generateRandomString()}@email.com`
          }
        })
        .then((personCreateResp) => {
          return cy.request({
            method: 'POST',
            url: `${baseUrl}${orgApiBase}`,
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
            url: `${baseUrl}${personApiBase}/${entities.person.id}`,
            headers: {
              "Content-Type": "application/json-patch+json"
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
            url: `${baseUrl}${orgApiBase}/${entities.org.id}`
          })
          .request({
            method: 'DELETE',
            url: `${baseUrl}${personApiBase}/${entities.person.id}`
          })
        });
  });

  it('Should set the organization membership through PATCH request via API', () => {
    cy
        .request({
          method: 'POST',
          url: `${baseUrl}${personApiBase}`,
          body: {
            email: `${UtilityFunctions.generateRandomString()}@email.com`
          }
        })
        .then((personCreateResp) => {
          return cy.request({
            method: 'POST',
            url: `${baseUrl}${orgApiBase}`,
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
            url: `${baseUrl}${personApiBase}/${entities.person.id}`,
            headers: {
              "Content-Type": "application/json-patch+json"
            },
            body:
                [
                  { op: 'add', path: '/organizationMemberships', value: entities.org.id }
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
            url: `${baseUrl}${orgApiBase}/${entities.org.id}`
          })
              .request({
                method: 'DELETE',
                url: `${baseUrl}${personApiBase}/${entities.person.id}`
              })
        });
  });
  // it('Should fail for invalid branch', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {},
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             branch: 'INVALID'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then(response => {
  //         expect(response.status).to.be.gte(400)
  //             .and.lt(500);
  //         return response;
  //       })
  //       .then((response) => {
  //         const requestBody = JSON.parse(response.allRequestResponses[0]?.['Request Body']);
  //         cy.request({
  //           method: 'DELETE',
  //           url: `${baseUrl}${personApiBase}/${requestBody.id}`
  //         })
  //       })
  // });
  // it('Should set rank to Unk if invalid', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {},
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             branch: 'USAF',
  //             rank: 'INVALID'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then((response) => {
  //         expect(response.body.rank).equal('Unk');
  //         cy.request({
  //           method: 'DELETE',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`
  //         })
  //       });
  //
  // });
  //
  // it('Should fail for invalid dodid', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {},
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             dodid: '0'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then(response => {
  //         expect(response.status).to.be.gte(400)
  //             .and.lt(500);
  //         return response;
  //       })
  //       .then((response) => {
  //         const requestBody = JSON.parse(response.allRequestResponses[0]?.['Request Body']);
  //         cy.request({
  //           method: 'DELETE',
  //           url: `${baseUrl}${personApiBase}/${requestBody.id}`
  //         })
  //       })
  //
  // });
  //
  // it('Should fail for invalid email', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {
  //         },
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             branch: 'INVALID'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then(response => {
  //         expect(response.status).to.be.gte(400)
  //             .and.lt(500);
  //         return response;
  //       })
  // });
  //
  // it('Should fail for invalid phone', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {
  //         },
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             phone: 'INVALID'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then(response => {
  //         expect(response.status).to.be.gte(400)
  //             .and.lt(500);
  //         return response;
  //       });
  // });
  // it('Should fail for invalid duty phone', () => {
  //   cy
  //       .request({
  //         method: 'POST',
  //         url: `${baseUrl}${personApiBase}`,
  //         body: {
  //         },
  //         failOnStatusCode: false
  //       })
  //       .then((response) => {
  //         return cy.request({
  //           method: 'PUT',
  //           url: `${baseUrl}${personApiBase}/${response.body.id}`,
  //           body: {
  //             id: response.body.id,
  //             dutyPhone: 'INVALID'
  //           },
  //           failOnStatusCode: false
  //         })
  //       })
  //       .then(response => {
  //         expect(response.status).to.be.gte(400)
  //             .and.lt(500);
  //         return response;
  //       })
  // });
})
