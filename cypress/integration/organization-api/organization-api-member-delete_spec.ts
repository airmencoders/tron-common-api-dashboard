///<reference types="Cypress" />

import { adminJwt, appClientHostOrganizationUrl, appClientTesterXfcc, nonAdminJwt, organizationUrl, personUrl, ssoXfcc } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';
import AppClientSetupFunctions from '../../support/app-client-setup-functions';

describe('Organization API Member DELETE', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should delete members', () => {
    const personA = {
      id: UtilityFunctions.uuidv4(),
    };
    PersonSetupFunctions.createPerson(personA);
    personIdsToDelete.add(personA.id);

    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA)
      .then(response => {
        cy.request<OrganizationDto>({
          url: `${organizationUrl}/${response.body.id}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          method: 'PUT',
          body: {
            ...response.body,
            members: [personA.id]
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.members).to.have.members([personA.id]);
        });
      });
    orgIdsToDelete.add(orgA.id);

    // Delete personA from orgA
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/members`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      body: [personA.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.not.include(personA.id);
    });

    // Ensure orgA still no longer has personA
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.not.include(personA.id);
    });

    // Ensure personA does not have memberships to orgA
    cy.request({
      url: `${personUrl}/${personA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships).to.not.include(orgA.id);
    });
  });

  it('should get Not Authorized with no Organization-members EFA permission', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

    // Create org
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString()
    };
    orgIdsToDelete.add(orgA.id);
    OrgSetupFunctions.createOrganization(orgA);

    // Create person for member
    const personA = {
      id: UtilityFunctions.uuidv4(),
      firstName: UtilityFunctions.generateRandomString(),
      primaryOrganizationId: orgA.id
    };
    PersonSetupFunctions.createPerson(personA);
    personIdsToDelete.add(personA.id);

    // Add person as member
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${response.body.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'PUT',
        body: {
          ...response.body,
          members: [personA.id]
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.have.members([personA.id]);
      });
    });

    // Request through App Client
    // This should return 403, no permission
    cy.request({
      url: `${appClientHostOrganizationUrl}/${orgA.id}/members`,
      headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
      method: 'DELETE',
      body: [personA.id],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(403);
    });

    // orgA should still have personA as member
    cy.request({
      url: `${organizationUrl}/${orgA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.have.members([personA.id]);
    });

    // personA should still have primaryOrganizationId set to orgA
    cy.request({
      url: `${personUrl}/${personA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.primaryOrganizationId).to.eq(orgA.id);
    });
  });

  it('should fail delete members with no body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/members`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete members with bad id path parameter', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/members`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete members with body including non-existant person uuid', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: "A" + UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/members`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      body: [UtilityFunctions.uuidv4()],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete members with empty json body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/members`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      body: {

      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});