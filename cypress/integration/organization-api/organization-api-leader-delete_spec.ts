///<reference types="Cypress" />

import { organizationUrl } from '../../support';
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
      method: 'DELETE'
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.notExists(response.body.leader, 'Leader should not exist');
    });
  });

  it('should fail delete leader with org id that does not exist', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}/leader`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(404);
    });
  });

  it('should fail delete leader with bad format UUID org id', () => {
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/badUUID/leader`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});