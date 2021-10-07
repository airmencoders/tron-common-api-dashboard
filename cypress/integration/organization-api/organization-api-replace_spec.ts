///<reference types="Cypress" />

import { adminJwt, organizationUrl, personUrl, ssoXfcc } from '../../support';
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
    const createdParentOrg = OrgSetupFunctions.generateBaseOrg();
    orgIdsToDelete.add(createdParentOrg.id);
    OrgSetupFunctions.createOrganization(createdParentOrg);

    // Create org for suborg
    const createdSubOrg = OrgSetupFunctions.generateBaseOrg();
    orgIdsToDelete.add(createdSubOrg.id);
    OrgSetupFunctions.createOrganization(createdSubOrg);

    // Create person for Leader
    const createdLeaderPerson = PersonSetupFunctions.generateBasePerson();
    PersonSetupFunctions.createPerson(createdLeaderPerson);
    personIdsToDelete.add(createdLeaderPerson.id);

    // Create person for member
    const createdMemberPerson = PersonSetupFunctions.generateBasePerson();
    PersonSetupFunctions.createPerson(createdMemberPerson);
    personIdsToDelete.add(createdMemberPerson.id);

    // Create org for replacement
    const baseOrg = OrgSetupFunctions.generateBaseOrg();
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
    const replacedOrg = {
      ...baseOrg,
      name: UtilityFunctions.generateRandomString(),
      branchType: OrganizationDtoBranchTypeEnum.Ussf,
      orgType: OrganizationDtoOrgTypeEnum.Flight,
      parentOrganization: createdParentOrg.id,
      leader: createdLeaderPerson.id,
      members: [createdMemberPerson.id],
      subordinateOrganizations: [createdSubOrg.id]
    }
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${baseOrg.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'PUT',
      body: {
        ...baseOrg,
        ...replacedOrg
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(replacedOrg.branchType);
      expect(response.body.orgType).to.eq(replacedOrg.orgType);
      expect(response.body.parentOrganization).to.eq(replacedOrg.parentOrganization);
      expect(response.body.name).to.eq(replacedOrg.name);
      expect(response.body.leader).to.eq(replacedOrg.leader);
      expect(response.body.members).include.members(replacedOrg.members);
      expect(response.body.subordinateOrganizations).include.members(replacedOrg.subordinateOrganizations);
    });

    // Ensure sub org has parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdSubOrg.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization, 'sub org should have parent').to.eq(replacedOrg.id);
    });

    // Ensure Parent org has subordinate
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${replacedOrg.parentOrganization}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations, 'parent org should have subordinates').to.include(replacedOrg.id);
    });

    // Ensure Leader has organization leaderships
    cy.request({
      url: `${personUrl}/${replacedOrg.leader}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        leaderships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationLeaderships, 'leader should have organization leaderships').to.include(replacedOrg.id);
    });

    // Ensure Member has organization membership
    cy.request({
      url: `${personUrl}/${createdMemberPerson.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships, 'member should have organization memberships').to.include(replacedOrg.id);
    });
  });
});