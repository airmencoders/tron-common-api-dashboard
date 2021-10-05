import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../../src/openapi';
import { adminJwt, appClientHostOrganizationUrl, appClientTesterXfcc, nonAdminJwt, organizationUrl, personUrl, ssoXfcc } from '../../../support';
import AppClientSetupFunctions from '../../../support/app-client-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../../support/cleanup-helper';
import OrgSetupFunctions from '../../../support/organization/organization-setup-functions';
import PersonSetupFunctions from '../../../support/person-setup-functions';
import UtilityFunctions from '../../../support/utility-functions';

describe('ORGANIZATION_EDIT EFA privilege', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  describe('PUT endpoint: /{id}', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PUT',
        body: {
          name: 'new'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-* privileges with 203', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      const personForLeader = {
        ...PersonSetupFunctions.generateBasePerson()
      };
      personIdsToDelete.add(personForLeader.id);
      PersonSetupFunctions.createPerson(personForLeader);

      const orgForParent = {
        ...OrgSetupFunctions.generateBaseOrg()
      };
      orgIdsToDelete.add(orgForParent.id);
      OrgSetupFunctions.createOrganization(orgForParent);

      const orgToCreate = {
        ...OrgSetupFunctions.generateBaseOrg()
      };
      OrgSetupFunctions.createOrganization(orgToCreate)
        .then(postResponse => {
          const createdOrg = postResponse.body;
          orgIdsToDelete.add(createdOrg.id);
          expect(postResponse.status).to.eq(201);
        });

      // Try to replace the org
      // Should get back denied fields for name, leader, parentOrganization, orgType, branchType
      cy.request({
        url: `${appClientHostOrganizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PUT',
        body: {
          ...orgToCreate,
          name: UtilityFunctions.generateRandomString(),
          leader: personForLeader.id,
          parentOrganization: orgForParent.id,
          orgType: OrganizationDtoOrgTypeEnum.Flight,
          branchType: OrganizationDtoBranchTypeEnum.Usn,
          pas: '123'
        }
      }).then(putResponse => {
        const updatedOrg = putResponse.body;
        expect(putResponse.status).to.eq(203);
        expect(putResponse.headers['warning']).to.contain('leader');
        expect(putResponse.headers['warning']).to.contain('name');
        expect(putResponse.headers['warning']).to.contain('parentOrganization');
        expect(putResponse.headers['warning']).to.contain('orgType');
        expect(putResponse.headers['warning']).to.contain('branchType');
        expect(putResponse.headers['warning']).to.contain('metadata');
        expect(updatedOrg).to.deep.eq({
          ...orgToCreate
        });
      });

      // Get the new entity again just to make sure
      cy.request({
        url: `${organizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const updatedOrg = response.body;
        expect(response.status).to.eq(200);
        expect(updatedOrg).to.deep.eq({
          ...orgToCreate
        });
      });

      // Make sure orgForParent does not contain orgToCreate as child
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${orgForParent.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        expect(org.subordinateOrganizations).not.to.include(orgToCreate.id);
      });

      // Make sure personForLeader does not contain organizationLeaderships or organizationMemberships
      cy.request({
        url: `${personUrl}/${personForLeader.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true,
          leaderships: true
        }
      }).then(response => {
        const person = response.body;
        expect(response.status).to.eq(200);
        expect(person.organizationMemberships).not.to.include(orgToCreate.id);
        expect(person.organizationLeaderships).not.to.include(orgToCreate.id);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-* privileges with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([
        'ORGANIZATION_EDIT',
        'Organization-name',
        'Organization-leader',
        'Organization-parentOrganization',
        'Organization-orgType',
        'Organization-branchType',
        'Organization-metadata'
      ]);

      const orgToCreate = OrgSetupFunctions.generateBaseOrg();
      orgIdsToDelete.add(orgToCreate.id);
      OrgSetupFunctions.createOrganization(orgToCreate)
        .then(postResponse => {
          const createdOrg = postResponse.body;
          orgIdsToDelete.add(createdOrg.id);
          expect(postResponse.status).to.eq(201);
        });

      const personForLeader = {
        ...PersonSetupFunctions.generateBasePerson()
      };
      personIdsToDelete.add(personForLeader.id);
      PersonSetupFunctions.createPerson(personForLeader);

      const orgForParent = {
        ...OrgSetupFunctions.generateBaseOrg()
      };
      orgIdsToDelete.add(orgForParent.id);
      OrgSetupFunctions.createOrganization(orgForParent);
      // Try to replace the org
      const replacedOrg = {
        ...orgToCreate,
        name: UtilityFunctions.generateRandomString(),
        leader: personForLeader.id,
        parentOrganization: orgForParent.id,
        orgType: OrganizationDtoOrgTypeEnum.Flight,
        branchType: OrganizationDtoBranchTypeEnum.Usn,
        pas: '123'
      }
      cy.request({
        url: `${appClientHostOrganizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PUT',
        body: {
          ...replacedOrg
        }
      }).then(putResponse => {
        const updatedOrg = putResponse.body;
        expect(putResponse.status).to.eq(200);
        expect(updatedOrg).to.deep.eq({
          ...replacedOrg
        });
      });

      // Ensure a GET request for the org also returns correctly
      cy.request({
        url: `${organizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        expect(org).to.deep.eq({
          ...replacedOrg
        });
      });
    });

    /**
     * Handle subordinateOrganization and members serparately because these have side effects
     */
    it('should allow with ORGANIZATION_EDIT + Organization-subordinateOrganizations & Organization-members privileges with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([
        'ORGANIZATION_EDIT',
        'Organization-members',
        'Organization-subordinateOrganizations',
      ]);

      const orgToCreate = OrgSetupFunctions.generateBaseOrg();
      orgIdsToDelete.add(orgToCreate.id);
      OrgSetupFunctions.createOrganization(orgToCreate)
        .then(postResponse => {
          const createdOrg = postResponse.body;
          orgIdsToDelete.add(createdOrg.id);
          expect(postResponse.status).to.eq(201);
        });

      const personForMember = {
        ...PersonSetupFunctions.generateBasePerson()
      };
      personIdsToDelete.add(personForMember.id);
      PersonSetupFunctions.createPerson(personForMember);

      const orgForSubordinate = {
        ...OrgSetupFunctions.generateBaseOrg()
      };
      orgIdsToDelete.add(orgForSubordinate.id);
      OrgSetupFunctions.createOrganization(orgForSubordinate);

      // Try to replace the org
      cy.request({
        url: `${appClientHostOrganizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PUT',
        body: {
          ...orgToCreate,
          subordinateOrganizations: [orgForSubordinate.id],
          members: [personForMember.id]
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({
          ...orgToCreate,
          subordinateOrganizations: [orgForSubordinate.id],
          members: [personForMember.id]
        });
      });

      // Ensure a GET request for the org also returns correctly
      cy.request({
        url: `${organizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        expect(org).to.deep.eq({
          ...orgToCreate,
          subordinateOrganizations: [orgForSubordinate.id],
          members: [personForMember.id]
        });
      });

      // Make sure orgForSubordinate contains orgForCreate as parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${orgForSubordinate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        expect(org.parentOrganization).to.eq(orgToCreate.id);
      });

      // Make sure personForMember actually has orgToCreate as organizationMemberships
      cy.request({
        url: `${personUrl}/${personForMember.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        const person = response.body;
        expect(response.status).to.eq(200);
        expect(person.organizationMemberships).to.include(orgToCreate.id);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-subordinateOrganizations & Organization-members privileges with 203 and no side effects should not exist', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([
        'ORGANIZATION_EDIT'
      ]);

      const orgToCreate = OrgSetupFunctions.generateBaseOrg();
      orgIdsToDelete.add(orgToCreate.id);
      OrgSetupFunctions.createOrganization(orgToCreate)
        .then(postResponse => {
          const createdOrg = postResponse.body;
          orgIdsToDelete.add(createdOrg.id);
          expect(postResponse.status).to.eq(201);
        });

      const personForMember = {
        ...PersonSetupFunctions.generateBasePerson()
      };
      personIdsToDelete.add(personForMember.id);
      PersonSetupFunctions.createPerson(personForMember);

      const orgForSubordinate = {
        ...OrgSetupFunctions.generateBaseOrg()
      };
      orgIdsToDelete.add(orgForSubordinate.id);
      OrgSetupFunctions.createOrganization(orgForSubordinate);

      // Try to replace the org
      cy.request({
        url: `${appClientHostOrganizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PUT',
        body: {
          ...orgToCreate,
          subordinateOrganizations: [orgForSubordinate.id],
          members: [personForMember.id]
        }
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.headers['warning']).to.contain('subordinateOrganizations');
        expect(response.headers['warning']).to.contain('members');
      });

      // Ensure a GET request for the org also returns correctly
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${orgToCreate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        expect(org.subordinateOrganizations).not.to.include(orgForSubordinate.id);
        expect(org.members).not.to.include(personForMember.id);
      });

      // Ensure the subordinate org does not have a parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${orgForSubordinate.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        const org = response.body;
        expect(response.status).to.eq(200);
        assert.notExists(org.parentOrganization);
      });

      // Ensure the person for member does not belong to the organization
      cy.request({
        url: `${personUrl}/${personForMember.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships).not.to.include(orgForSubordinate.id);
      });
    });
  });

  describe('DELETE endpoint: /{id}/leader', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/leader`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with only ORGANIZATION_EDIT and no Organization-leader with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create person for leader
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org and assign leader
      const orgA = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        leader: createdPerson.id
      };
      orgIdsToDelete.add(orgA.id);
      OrgSetupFunctions.createOrganization(orgA)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.leader).to.eq(createdPerson.id);
        });

      // Try to delete leader
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${orgA.id}/leader`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-leader privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-leader']);

      // Create person for leader
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org and assign leader
      const orgA = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        leader: createdPerson.id
      };
      orgIdsToDelete.add(orgA.id);
      OrgSetupFunctions.createOrganization(orgA)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.leader).to.eq(createdPerson.id);
        });

      // Ensure createdPerson has orgA under organizationLeaderships
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          leaderships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationLeaderships).to.include(orgA.id);
      });

      // Try to delete leader
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${orgA.id}/leader`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.leader).to.eq(null);
      });

      // Ensure createPerson no longer has orgA in organizationLeaderships
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          leaderships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationLeaderships).to.not.include(orgA.id);
      });

      // Ensure orgA no longer has a leader
      cy.request({
        url: `${organizationUrl}/${orgA.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        assert.notExists(response.body.leader, 'should not have a leader');
      });
    });
  });

  describe('DELETE endpoint: /{id}/parent', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/parent`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with only ORGANIZATION_EDIT and no Organization-parentOrganization with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create org for parent
      const parentOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString()
      };
      orgIdsToDelete.add(parentOrg.id);
      OrgSetupFunctions.createOrganization(parentOrg);

      // Create org and assign parent
      const subOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        parentOrganization: parentOrg.id
      };
      orgIdsToDelete.add(subOrg.id);
      OrgSetupFunctions.createOrganization(subOrg)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.parentOrganization).to.eq(parentOrg.id);
        });

      // Try to delete parent
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${subOrg.id}/parent`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });

      // subOrg should still have parentOrg as parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${subOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(parentOrg.id);
      });

      // parentOrg should still have subOrg in subordinateOrganizations
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${parentOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.include(subOrg.id);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-parentOrganization privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-parentOrganization']);

      // Create org for parent
      const parentOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString()
      };
      orgIdsToDelete.add(parentOrg.id);
      OrgSetupFunctions.createOrganization(parentOrg);

      // Create org and assign parent
      const subOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        parentOrganization: parentOrg.id
      };
      orgIdsToDelete.add(subOrg.id);
      OrgSetupFunctions.createOrganization(subOrg)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.parentOrganization).to.eq(parentOrg.id);
        });

      // Try to delete parent
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${subOrg.id}/parent`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(null);
      });

      // subOrg should not have parentOrg as parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${subOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        assert.notExists(response.body.parentOrganization, 'parent organization should not exist');
      });

      // parentOrg should not have subOrg in subordinateOrganizations
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${parentOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.not.include(subOrg.id);
      });
    });
  });

  describe('DELETE endpoint: /{id}/members', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and no Organization-members privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create person for member
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org and assign member
      const createdOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        members: [createdPerson.id]
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.members).to.contain(createdPerson.id);
        });

      // Try to delete members
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        body: [createdPerson.id],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });

      // Org should still have members
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.include(createdPerson.id);
      });

      // Person should still be a part of org
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships).to.include(createdOrg.id);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-members privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-members']);

      // Create person for member
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org and assign member
      const createdOrg = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
        members: [createdPerson.id]
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg)
        .then(response => {
          expect(response.status).to.eq(201);
          expect(response.body.members).to.contain(createdPerson.id);
        });

      // try to delete
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.not.contain(createdPerson.id);
      });

      // Org should no longer have members
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.not.include(createdPerson.id);
      });

      // Person should not be a part of org
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships).to.not.include(createdOrg.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}/members', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and no Organization-members privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create person for member
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // Try to assign member
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [createdPerson.id],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });

      // Org should no not have members
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.not.include(createdPerson.id);
      });

      // Person should not be a part of org
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships).to.not.include(createdOrg.id);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-members privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-members']);

      // Create person for member
      const createdPerson = {
        id: UtilityFunctions.uuidv4(),
        firstName: UtilityFunctions.generateRandomString()
      };
      PersonSetupFunctions.createPerson(createdPerson);
      personIdsToDelete.add(createdPerson.id);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // Try to assign member
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.contain(createdPerson.id);
      });

      // Org should have members
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.include(createdPerson.id);
      });

      // Person should be a part of org
      cy.request({
        url: `${personUrl}/${createdPerson.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships).to.include(createdOrg.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}/subordinates', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-subordinateOrganizations privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create org for subordinate
      const createdSubOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdSubOrg.id);
      OrgSetupFunctions.createOrganization(createdSubOrg);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // try to add subordinate
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [createdSubOrg.id],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });

      // Org should not have any subordinates
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.not.include(createdSubOrg.id);
      });

      // sub org should not have a parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdSubOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        assert.notExists(response.body.parentOrganization, 'should not have a parent');
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-subordinateOrganizations privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-subordinateOrganizations']);

      // Create org for subordinate
      const createdSubOrgA = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdSubOrgA.id);
      OrgSetupFunctions.createOrganization(createdSubOrgA);

      // Create org for subordinate
      const createdSubOrgB = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdSubOrgB.id);
      OrgSetupFunctions.createOrganization(createdSubOrgB);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // try to add a, b subordinates
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [createdSubOrgA.id, createdSubOrgB.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.contain.members([createdSubOrgA.id, createdSubOrgB.id])
      });

      // Org should have a, b subordinates
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).include.members([createdSubOrgB.id, createdSubOrgA.id]);
      });

      // sub org a should have a parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdSubOrgA.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(createdOrg.id);
      });

      // sub org b should have a parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdSubOrgB.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(createdOrg.id);
      });
    });
  });

  describe('DELETE endpoint: /{id}/subordinates', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-subordinateOrganizations privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);

      // Create org for subordinate
      const createdSubOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdSubOrg.id);
      OrgSetupFunctions.createOrganization(createdSubOrg);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4(),
        subordinateOrganizations: [createdSubOrg.id]
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg)
        .then(response => {
          expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
        });

      // try to delete subordinates
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        body: [createdSubOrg.id],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });

      // sub org should still have parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdSubOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(createdOrg.id);
      });

      // parent org should still have suborg
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.include(createdSubOrg.id);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-subordinateOrganizations privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-subordinateOrganizations']);

      // Create org for subordinate
      const createdSubOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdSubOrg.id);
      OrgSetupFunctions.createOrganization(createdSubOrg);

      // Create org
      const createdOrg = {
        id: UtilityFunctions.uuidv4(),
        subordinateOrganizations: [createdSubOrg.id]
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg)
        .then(response => {
          expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
        });

      // try to delete
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'DELETE',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.not.contain(createdSubOrg.id);
      });

      // sub org should no longer have parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdSubOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        assert.notExists(response.body.parentOrganization, 'should not have parent');
      });

      // parent org should not have suborg
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdOrg.id}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).not.to.include(createdSubOrg.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'POST',
        body: OrgSetupFunctions.generateBaseOrg(),
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow patch with efa privileges and fail with no efa privileges (Organization-?)', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT']);
      // Create org for parent
      const createdParentOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdParentOrg.id);
      OrgSetupFunctions.createOrganization(createdParentOrg);

      // Create person for Leader
      const createdLeaderId = UtilityFunctions.uuidv4();
      personIdsToDelete.add(createdLeaderId);
      cy.request<PersonDto>({
        url: `${personUrl}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'POST',
        body: {
          id: createdLeaderId,
          firstName: UtilityFunctions.generateRandomString()
        }
      }).then(response => {
        expect(response.status).to.eq(201);
      });

      // Create org to patch
      const createdOrg = {
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // Try to patch with no field privileges
      const patchOrgDetails = {
        ...createdOrg,
        name: UtilityFunctions.generateRandomString(),
        leader: createdLeaderId,
        parentOrganization: createdParentOrg.id,
        orgType: OrganizationDtoOrgTypeEnum.Flight,
        branchType: OrganizationDtoBranchTypeEnum.Ussf
      };
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}`,
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json-patch+json",
          "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc
        },
        body: [
          { op: 'replace', path: '/leader', value: patchOrgDetails.leader },
          { op: 'replace', path: '/name', value: patchOrgDetails.name },
          { op: 'replace', path: '/parentOrganization', value: patchOrgDetails.parentOrganization },
          { op: 'replace', path: '/orgType', value: patchOrgDetails.orgType },
          { op: 'replace', path: '/branchType', value: patchOrgDetails.branchType }
        ]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.headers['warning']).to.contain('leader');
        expect(response.headers['warning']).to.contain('name');
        expect(response.headers['warning']).to.contain('parentOrganization');
        expect(response.headers['warning']).to.contain('orgType');
        expect(response.headers['warning']).to.contain('branchType');
        expect(response.body.branchType).to.not.eq(patchOrgDetails.branchType);
        expect(response.body.orgType).to.not.eq(patchOrgDetails.orgType);
        expect(response.body.parentOrganization).to.not.eq(patchOrgDetails.parentOrganization);
        expect(response.body.name).to.not.eq(patchOrgDetails.name);
        expect(response.body.leader).to.not.eq(patchOrgDetails.leader);
      });

      // ensure leader does not have organizationLeadership
      cy.request({
        url: `${personUrl}/${patchOrgDetails.leader}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          leaderships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationLeaderships, 'the patched leader should not organization leaderships').to.not.include(patchOrgDetails.id);
      });

      // ensure parent org does not have subordinate
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${patchOrgDetails.parentOrganization}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations, 'the patched parent org should not have subordinates').to.not.include(patchOrgDetails.id);
      });

      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-leader', 'Organization-name', 'Organization-parentOrganization', 'Organization-orgType', 'Organization-branchType']);

      // Try to patch with all privileges
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}`,
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json-patch+json",
          "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc
        },
        body: [
          { op: 'replace', path: '/leader', value: patchOrgDetails.leader },
          { op: 'replace', path: '/name', value: patchOrgDetails.name },
          { op: 'replace', path: '/parentOrganization', value: patchOrgDetails.parentOrganization },
          { op: 'replace', path: '/orgType', value: patchOrgDetails.orgType },
          { op: 'replace', path: '/branchType', value: patchOrgDetails.branchType }
        ]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.branchType).to.eq(patchOrgDetails.branchType);
        expect(response.body.orgType).to.eq(patchOrgDetails.orgType);
        expect(response.body.parentOrganization).to.eq(patchOrgDetails.parentOrganization);
        expect(response.body.name).to.eq(patchOrgDetails.name);
        expect(response.body.leader).to.eq(patchOrgDetails.leader);
      });

      // ensure leader has organizationLeadership
      cy.request({
        url: `${personUrl}/${patchOrgDetails.leader}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET',
        qs: {
          leaderships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationLeaderships, 'the patched leader should include organization leaderships').to.include(patchOrgDetails.id);
      });

      // ensure parent org has subordinate
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${patchOrgDetails.parentOrganization}`,
        headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations, 'the patched parent org should have subordinates').to.include(patchOrgDetails.id);
      });
    });
  });
});