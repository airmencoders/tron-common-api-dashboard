///<reference types="Cypress" />

import { appClientHostOrganizationUrl, organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';
import AppClientSetupFunctions from '../../support/app-client-setup-functions';

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

    // Send request to delete only orgA
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'DELETE',
      body: [orgA.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.include(orgB.id);
      expect(response.body.subordinateOrganizations).to.not.include(orgA.id);
    });

    // Just ensure orgC only has orgB
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.contain(orgB.id);
      expect(response.body.subordinateOrganizations).to.not.include(orgA.id);
    });

    // Ensure orgA no longer has parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.parentOrganization);
    });

    // Ensure orgB still has parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgB.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(orgC.id);
    });
  });

  it('should rollback transaction if EFA fails, no permissions', () => {
    AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

    // Create org for subordinate
    const orgA = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(orgA.id);
    OrgSetupFunctions.createOrganization(orgA);

    // Create org for subordinate
    const orgB = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(orgB.id);
    OrgSetupFunctions.createOrganization(orgB);

    // Create parent
    const orgC = {
      id: UtilityFunctions.uuidv4(),
      subordinateOrganizations: [orgA.id, orgB.id]
    };
    orgIdsToDelete.add(orgC.id);
    OrgSetupFunctions.createOrganization(orgC)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
      });

    // Request through App Client
    // This should return 203, no permission
    cy.request({
      url: `${appClientHostOrganizationUrl}/${orgC.id}/subordinates`,
      method: 'DELETE',
      body: [orgB.id, orgA.id]
    }).then(response => {
      expect(response.status).to.eq(203);
      expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
      expect(response.headers['warning']).to.contain('subordinateOrganizations');
    });

    // Ensure orgC still has orgA, orgB as suborgs
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}`,
      method: 'GET',
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
    });

    // orgA, orgB should still have orgC as parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(orgC.id);
    });

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgB.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(orgC.id);
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

  it('should rollback transaction if exception occurs', () => {
    // Create org for subordinate
    const orgA = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(orgA.id);
    OrgSetupFunctions.createOrganization(orgA);

    // Create org for subordinate
    const orgB = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(orgB.id);
    OrgSetupFunctions.createOrganization(orgB);

    // Create parent
    const orgC = {
      id: UtilityFunctions.uuidv4(),
      subordinateOrganizations: [orgA.id, orgB.id]
    };
    orgIdsToDelete.add(orgC.id);
    OrgSetupFunctions.createOrganization(orgC)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
      });

    // This should fail because by passing in non-existant suborg id
    cy.request({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'DELETE',
      body: [orgB.id, orgA.id, UtilityFunctions.uuidv4()],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });

    // Ensure orgC still has orgA, orgB as suborgs
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}`,
      method: 'GET',
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.have.members([orgA.id, orgB.id]);
    });

    // orgA, orgB should still have orgC as parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(orgC.id);
    });

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgB.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(orgC.id);
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