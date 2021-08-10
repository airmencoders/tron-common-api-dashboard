///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Subordinate DELETE', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should delete sub organizations', () => {
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
      .then(response => {
        cy.request<OrganizationDto>({
          url: `${organizationUrl}/${response.body.id}`,
          method: 'PUT',
          body: {
            ...response.body,
            subordinateOrganizations: [orgA.id, orgB.id]
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
        });
      });
    orgIdsToDelete.add(orgC.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'DELETE',
      body: [orgA.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.include(orgB.id);
      expect(response.body.subordinateOrganizations).to.not.include(orgA.id);
    });
  });

  it('should fail delete sub organizations with no body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete sub organizations with bad id path parameter', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/subordinates`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete sub organizations with body including non-existant suborg uuid', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    const orgC = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgC)
      .then(response => {
        cy.request<OrganizationDto>({
          url: `${organizationUrl}/${response.body.id}`,
          method: 'PUT',
          body: {
            ...response.body,
            subordinateOrganizations: [orgA.id]
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.subordinateOrganizations).to.have.members([orgA.id]);
        });
      });
    orgIdsToDelete.add(orgC.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'DELETE',
      body: [UtilityFunctions.uuidv4()],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail delete sub organizations with empty json body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
      method: 'DELETE',
      body: {

      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});