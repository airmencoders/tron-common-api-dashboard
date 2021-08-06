///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

describe('Organization API Replace', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow Organization to be replaced through PUT', () => {
    // Create org for parent
    const createdParentOrg = {
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(createdParentOrg.id);
    OrgSetupFunctions.createOrganization(createdParentOrg);

    // Create person for Leader
    const createdLeaderPerson = {
      id: UtilityFunctions.uuidv4(),
      firstName: UtilityFunctions.generateRandomString()
    };
    PersonSetupFunctions.createPerson(createdLeaderPerson);
    personIdsToDelete.add(createdLeaderPerson.id);

    // Create org for replacement
    const baseOrg = {
      ...OrgSetupFunctions.generateBaseOrg(),
      id: UtilityFunctions.uuidv4()
    };
    orgIdsToDelete.add(baseOrg.id);
    OrgSetupFunctions.createOrganization(baseOrg)
      .then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.branchType).to.eq(baseOrg.branchType);
        expect(response.body.orgType).to.eq(baseOrg.orgType);
        expect(response.body.parentOrganization).to.eq(null);
        expect(response.body.name).to.eq(baseOrg.name);
        expect(response.body.leader).to.eq(null);
      });

    // Replace Org and expect the new values in response
    const newName = UtilityFunctions.generateRandomString();
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${baseOrg.id}`,
      method: 'PUT',
      body: {
        ...baseOrg,
        branchType: OrganizationDtoBranchTypeEnum.Ussf,
        orgType: OrganizationDtoOrgTypeEnum.Flight,
        parentOrganization: createdParentOrg.id,
        leader: createdLeaderPerson.id,
        name: newName
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(OrganizationDtoBranchTypeEnum.Ussf);
      expect(response.body.orgType).to.eq(OrganizationDtoOrgTypeEnum.Flight);
      expect(response.body.parentOrganization).to.eq(createdParentOrg.id);
      expect(response.body.name).to.eq(newName);
      expect(response.body.leader).to.eq(createdLeaderPerson.id);
    });
  });
});