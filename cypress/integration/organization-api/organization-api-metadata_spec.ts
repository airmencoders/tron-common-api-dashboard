///<reference types="Cypress" />

import { adminJwt, organizationUrl, ssoXfcc } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Metadata', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow organization to add/update/delete metadata', () => {
    // Create org to
    const orgToCreate = {
      ...OrgSetupFunctions.generateBaseOrg(),
      id: UtilityFunctions.uuidv4(),
      orgType: "SQUADRON",
      pas: 'TEST PAS'
    };
    orgIdsToDelete.add(orgToCreate.id);

    // Create org with metadata
    cy.request({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'POST',
      body: orgToCreate
    }).then(response => {
      expect(response.status).to.eq(201);
      expect(response.body.pas).to.eq(orgToCreate.pas);
    });

    // ensure metadata actually exists
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.eq(orgToCreate);
    });

    // Try to remove PAS metadata
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'PUT',
      body: {
        ...orgToCreate,
        pas: null
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.pas, 'metadata should not exist');
    });

    // ensure metadata actually deleted
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.pas, 'metadata should not exist');
    });

    // Try to update to add PAS metadata
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'PUT',
      body: {
        ...orgToCreate,
        pas: 'Another PAS test'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.pas).to.eq('Another PAS test');
    });

    // ensure metadata actually updated
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.pas).to.eq('Another PAS test');
    });

    // Try to update an existing PAS metadata value
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'PUT',
      body: {
        ...orgToCreate,
        pas: 'Updated PAS'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.pas).to.eq('Updated PAS');
    });

    // ensure metadata actually updated
    cy.request({
      url: `${organizationUrl}/${orgToCreate.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.pas).to.eq('Updated PAS');
    });
  });
});