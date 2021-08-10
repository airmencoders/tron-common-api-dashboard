///<reference types="Cypress" />

import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto, OrganizationDtoResponseWrapper } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';
import { organizationUrl } from '../../support';

describe('Organization API Bulk Creation', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow bulk creation', () => {
    const orgsToCreate: OrganizationDto[] = [];
    for (let i = 0; i < 5; i++) {
      orgsToCreate.push(OrgSetupFunctions.generateBaseOrg());
    }

    cy.request<OrganizationDtoResponseWrapper>({
      url: `${organizationUrl}/organizations`,
      method: 'POST',
      body: orgsToCreate
    }).then(response => {
      response.body.data.forEach(org => orgIdsToDelete.add(org.id));
      expect(response.status).to.eq(201);
    });
  });

  it('should fail bulk creation with bad data with 400', () => {
    const orgsToCreate: OrganizationDto[] = [];
    for (let i = 0; i < 5; i++) {
      orgsToCreate.push(OrgSetupFunctions.generateBaseOrg());
    }

    orgsToCreate[3].leader = 'bad uuid';

    /**
     * Don't need to cleanup here because no orgs will be created
     * since this will fail validation before attempting to add
     */
    cy.request<OrganizationDtoResponseWrapper>({
      url: `${organizationUrl}/organizations`,
      method: 'POST',
      body: orgsToCreate,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail bulk creation duplicted IDs with 409', () => {
    const orgsToCreate: OrganizationDto[] = [];
    const duplicateId = UtilityFunctions.uuidv4();
    for (let i = 0; i < 5; i++) {
      let org = OrgSetupFunctions.generateBaseOrg();
      org = {
        ...org,
        id: i % 2 === 0 ? duplicateId : UtilityFunctions.uuidv4()
      }

      orgsToCreate.push(org);
      orgIdsToDelete.add(org.id);
    }

    cy.request<OrganizationDtoResponseWrapper>({
      url: `${organizationUrl}/organizations`,
      method: 'POST',
      body: orgsToCreate,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(409);
    });
  });
});