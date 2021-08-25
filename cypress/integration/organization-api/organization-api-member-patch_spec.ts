///<reference types="Cypress" />

import { appClientHostOrganizationUrl, organizationUrl, personUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';
import AppClientSetupFunctions from '../../support/app-client-setup-functions';

describe('Organization API Member PATCH', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should add members', () => {
    const personA = {
      id: UtilityFunctions.uuidv4(),
    };
    PersonSetupFunctions.createPerson(personA);
    personIdsToDelete.add(personA.id);

    const personB = {
      id: UtilityFunctions.uuidv4(),
    };
    PersonSetupFunctions.createPerson(personB);
    personIdsToDelete.add(personB.id);

    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/members`,
      method: 'PATCH',
      body: [personA.id, personB.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.have.members([personA.id, personB.id]);
    });

    // Ensure orgA does have personA and personB
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.have.members([personA.id, personB.id]);
    });

    // Ensure personA has membership to orgA
    cy.request({
      url: `${personUrl}/${personA.id}`,
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships).to.include(orgA.id);
    });

    // Ensure personB has membership to orgA
    cy.request({
      url: `${personUrl}/${personB.id}`,
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships).to.include(orgA.id);
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
    };
    PersonSetupFunctions.createPerson(personA);
    personIdsToDelete.add(personA.id);

    // Request through App Client
    // This should return 403, no permission
    cy.request({
      url: `${appClientHostOrganizationUrl}/${orgA.id}/members`,
      method: 'PATCH',
      body: [personA.id],
      qs: {
        primary: true
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(403);
    });

    // orgA should not have personA
    cy.request({
      url: `${organizationUrl}/${orgA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.not.have.members([personA.id]);
    });

    // personA should not have primaryOrganizationId set
    cy.request({
      url: `${personUrl}/${personA.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.primaryOrganizationId, 'primaryOrganizationId should not exist');
    });
  });

  it('should fail PATCH members with no body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/members`,
      method: 'PATCH',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH members with bad id path parameter', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/members`,
      method: 'PATCH',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH members with body including non-existant person uuid', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: "A" + UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/members`,
      method: 'PATCH',
      body: [UtilityFunctions.uuidv4()],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail PATCH members with empty json body', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/members`,
      method: 'PATCH',
      body: {

      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});