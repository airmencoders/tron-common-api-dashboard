///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

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

    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${orgA.id}/members`,
      method: 'PATCH',
      body: [personA.id]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.members).to.include(personA.id);
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