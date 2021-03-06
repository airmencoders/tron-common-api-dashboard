///<reference types="Cypress" />

import { adminJwt, organizationUrl, personUrl, ssoXfcc } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

describe('Organization API Leader DELETE', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should delete Leader', () => {
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
            leader: personA.id
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.leader).to.eq(personA.id);
        });
      });
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/leader`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.leader, 'Leader should not exist');
    });

    // Ensure leader has truly been deleted
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.leader, 'Leader should not exist');
    });

    // Ensure person no longer has organization leaderships
    cy.request({
      url: `${personUrl}/${personA.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        leaderships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationLeaderships, 'person should not have any organization leaderships').to.not.include(orgA.id);
    });
  });

  it('should fail delete leader with org id that does not exist', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/leader`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('should fail delete leader with bad format UUID org id', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/leader`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});