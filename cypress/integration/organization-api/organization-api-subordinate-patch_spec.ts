///<reference types="Cypress" />

import { appClientHostOrganizationUrl, organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';
import AppClientSetupFunctions from '../../support/app-client-setup-functions';

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

    // PATCH to add subordinate orgs
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}/subordinates`,
      method: 'PATCH',
      body: [orgA.id, orgB.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.have.members([orgB.id, orgA.id]);
    });

    // Just ensure orgC does infact have both children
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgC.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.have.members([orgB.id, orgA.id]);
    });

    // Check that orgA and orgB also have their parent set to orgC
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

  it('should rollback transaction if trying to add subordinate that already has a parent', () => {
    // Create org for subordinate
    const createdSubOrg = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(createdSubOrg.id);
    OrgSetupFunctions.createOrganization(createdSubOrg);

    // Create initial parent org for subordinate
    const initialParentOrg = {
      id: UtilityFunctions.uuidv4(),
      subordinateOrganizations: [createdSubOrg.id]
    };
    orgIdsToDelete.add(initialParentOrg.id);
    OrgSetupFunctions.createOrganization(initialParentOrg)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.subordinateOrganizations).to.include(createdSubOrg.id);
      });

    // Create org for subordinate not tied to a parent
    const subOrgNoParent = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(subOrgNoParent.id);
    OrgSetupFunctions.createOrganization(subOrgNoParent);

    // Create org
    const createdOrg = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(createdOrg.id);
    OrgSetupFunctions.createOrganization(createdOrg);

    // This should fail because createdSubOrg has a parent already
    cy.request({
      url: `${organizationUrl}/${createdOrg.id}/subordinates`,
      method: 'PATCH',
      body: [subOrgNoParent.id, createdSubOrg.id],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });

    // Ensure createdOrg does NOT have any children
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdOrg.id}`,
      method: 'GET',
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.isEmpty(response.body.subordinateOrganizations, 'should not have any subordinates');
    });

    // createdSubOrg should still have initialParentOrg as parent
    // and initialParentOrg should still have createdSubOrg as subordinate
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdSubOrg.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization).to.eq(initialParentOrg.id);
    });

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${initialParentOrg.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
    });

    // subOrgNoParent should still have no parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${subOrgNoParent.id}`,
      method: 'GET',
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.parentOrganization, 'should not have any subordinates');
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