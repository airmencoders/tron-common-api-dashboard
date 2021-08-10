///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';

describe('Organization API Deletion', () => {
  it('should allow deletion', () => {
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: OrgSetupFunctions.generateBaseOrg()
    }).then(response => {
      expect(response.status).to.eq(201);

      cy.request({
        url: `${organizationUrl}/${response.body.id}`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.equal(204);
      });
    });
  });

  it('should fail deletion on non-existant org uuid with 404', () => {
    cy.request({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(404);
    });
  });

  it('should fail deletion on bad org uuid query param with 400', () => {
    cy.request({
      url: `${organizationUrl}/baduuidparam`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(400);
    });
  });
});