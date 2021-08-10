///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Subordinate PATCH', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should add sub organizations', () => {
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
    OrgSetupFunctions.createOrganization(orgB);
    orgIdsToDelete.add(orgB.id);

    const orgC = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgC)
    orgIdsToDelete.add(orgC.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'PATCH',
      body: [orgA.id, orgB.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.have.members([orgB.id, orgA.id]);
    });
  });

  it('should fail PATCH sub organizations with no body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
      method: 'PATCH',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH sub organizations with bad id path parameter', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/subordinates`,
      method: 'PATCH',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH sub organizations with body including non-existant suborg uuid', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/subordinates`,
      method: 'PATCH',
      body: [UtilityFunctions.uuidv4()],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH sub organizations with empty json body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
      method: 'PATCH',
      body: {

      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});