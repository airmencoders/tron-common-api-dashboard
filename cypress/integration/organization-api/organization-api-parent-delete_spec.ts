///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Parent DELETE', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should delete parent', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    const orgB = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgB)
      .then(response => {
        cy.request<OrganizationDto>({
          url: `${organizationUrl}/${response.body.id}`,
          method: 'PUT',
          body: {
            ...response.body,
            parentOrganization: orgA.id
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.parentOrganization).to.eq(orgA.id);
        });
      });
    orgIdsToDelete.add(orgB.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgB.id}/parent`,
      method: 'DELETE'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.parentOrganization, 'Parent Org should not exist');
    });
  });

  it('should fail delete parent with org id that does not exist', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/parent`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('should fail delete parent with bad format UUID org id', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/parent`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete parent with organization with no parent', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/parent`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});