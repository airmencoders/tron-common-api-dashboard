import { adminJwt, appClientUrl, organizationUrl, personUrl, ssoXfcc } from '.';
import AppClientSetupFunctions from './app-client-setup-functions';
import OrgSetupFunctions from './organization/organization-setup-functions';
import PersonSetupFunctions from './person-setup-functions';

export const orgIdsToDelete: Set<string> = new Set();
export const personIdsToDelete: Set<string> = new Set();

export function cleanup() {
  orgIdsToDelete.forEach((id) => {
    cy.request({
      url: `${organizationUrl}/${id}`,
      method: 'DELETE',
      headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        orgIdsToDelete.delete(id);
      }
    });
  });

  personIdsToDelete.forEach((id) => {
    cy.request({
      url: `${personUrl}/${id}`,
      method: 'DELETE',
      headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        personIdsToDelete.delete(id);
      }
    });
  });
}

export function prepForTest() {

  cy.request({
    method: 'POST',
    url: `${personUrl}/filter`,
    headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
    qs: {
      size: 100,
    },
    body: {
      filterCriteria: [
        {
          relationType: 'OR',
          field: 'email',
          conditions: [
            {
              operator: 'EQUALS',
              value: 'cypress.test@test.com'
            },
            {
              operator: 'STARTS_WITH',
              value: '0.',
            },
            {
              operator: 'STARTS_WITH',
              value: 'name0.email',
            },
            {
              operator: 'STARTS_WITH',
              value: 'name1.email',
            },
            {
              operator: 'STARTS_WITH',
              value: 'personJwt@test.com',
            },
          ],
        },        
      ],
    },
  }).then((response) => {
    if (
      response.status >= 200 &&
      response.status < 300 &&
      response.body &&
      response.body.data
    ) {
      for (let person of response.body.data) {
        PersonSetupFunctions.deletePerson(person.id);
      }
    }
  }).then(() => 
    cy.request({
      method: 'POST',
      url: `${personUrl}/filter`,
      headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
      qs: {
        size: 100,
      },
      body: {
        filterCriteria: [
          {
            relationType: 'OR',
            field: 'firstName',
            conditions: [
              {
                operator: 'STARTS_WITH',
                value: '0.',
              },
              {
                operator: 'EQUALS',
                value: 'aaaaaaaaaaaaa',
              },
              {
                operator: 'EQUALS',
                value: 'NewFirst',
              },
              {
                operator: 'EQUALS',
                value: 'zzzzzzzzzzzzzz',
              },
              {
                operator: 'EQUALS',
                value: 'givenName',
              },
              {
                operator: 'EQUALS',
                value: 'firstName1',
              },
              {
                operator: 'EQUALS',
                value: 'firstName2',
              },
            ],
          },      
        ],
      },
    })  
  ).then((response) => {
    if (
      response.status >= 200 &&
      response.status < 300 &&
      response.body &&
      response.body.data
    ) {
      for (let person of response.body.data) {
        PersonSetupFunctions.deletePerson(person.id);
      }
    }
  }).then(() => 
    cy.request({
      method: 'POST',
      url: `${organizationUrl}/filter`,
      headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
      qs: {
        size: 100,
      },
      body: {
        filterCriteria: [
          {
            relationType: 'OR',
            field: 'name',
            conditions: [
              {
                operator: 'STARTS_WITH',
                value: '0.',
              },
            ],
          },
        ],
      },
    }).then((response) => {
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.body &&
        response.body.data
      ) {
        for (let org of response.body.data) {
          OrgSetupFunctions.deleteOrganization(org.id);
        }
      }
    })
  ).then(() => 
    cy.request({
      method: 'GET',
      url: `${appClientUrl}`,
      headers: { authorization: adminJwt, 'x-forwarded-client-cert': ssoXfcc },
      qs: {
        size: 100,
      },
      body: {
        filterCriteria: [
          {
            relationType: 'OR',
            field: 'name',
            conditions: [
              {
                operator: 'STARTS_WITH',
                value: '0.',
              },
            ],
          },
        ],
      },
    }).then((response) => {
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.body &&
        response.body.data
      ) {
        for (let client of response.body.data) {
          if (client.name.startsWith('0.')) {
            AppClientSetupFunctions.removeAppClient(client.id);
          }
        }
      }
    })
  )
}
