///<reference types="Cypress" />

import { adminJwt, organizationUrl, personUrl, ssoXfcc } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

describe('Organization API Deletion', () => {
  it('should allow deletion', () => {
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

    const orgToDelete = {
      ...OrgSetupFunctions.generateBaseOrg(),
      parentOrganization: createdParentOrg.id,
      subordinateOrganizations: [createdSubOrg.id],
      leader: createdLeaderPerson.id,
      members: [createdMemberPerson.id]
    };
    orgIdsToDelete.add(orgToDelete.id);
    OrgSetupFunctions.createOrganization(orgToDelete);

    // delete the org
    cy.request({
      url: `${organizationUrl}/${orgToDelete.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
    }).then(response => {
      expect(response.status).to.equal(204);
    });

    // Leader should not have organization leaderships
    cy.request({
      url: `${personUrl}/${createdLeaderPerson.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        leaderships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationLeaderships, 'leader should not have organization leaderships').not.to.include(orgToDelete.id);
    });

    // Member should not have organization memberships
    cy.request({
      url: `${personUrl}/${createdMemberPerson.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships, 'member should not have organization memberships').not.to.include(orgToDelete.id);
    });

    // Parent org should not have subordinate organizations
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdParentOrg.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations, 'parent org should not have subordinates').not.to.include(orgToDelete.id);
    });

    // Sub org should not have parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdSubOrg.id}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization, 'sub org should not have parent').not.to.eq(orgToDelete.id);
    });
  });

  it('should fail deletion on non-existant org uuid with 404', () => {
    cy.request({
      url: `${organizationUrl}/${UtilityFunctions.uuidv4()}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(404);
    });
  });

  it('should fail deletion on bad org uuid query param with 400', () => {
    cy.request({
      url: `${organizationUrl}/baduuidparam`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.equal(400);
    });
  });
});