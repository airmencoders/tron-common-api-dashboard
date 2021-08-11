import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../../src/openapi';
import { appClientHostOrganizationUrl, organizationUrl, personUrl } from '../../../support';
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
        method: 'PUT',
        body: {
          name: 'new'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_EDIT + Organization-name privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-name']);

      OrgSetupFunctions.createOrganization()
        .then(postResponse => {
          const createdOrg = postResponse.body;
          orgIdsToDelete.add(createdOrg.id);
          expect(postResponse.status).to.eq(201);

          // Try to replace the org
          cy.request({
            url: `${appClientHostOrganizationUrl}/${createdOrg.id}`,
            method: 'PUT',
            body: {
              ...createdOrg,
              name: 'New Org Name'
            }
          }).then(putResponse => {
            const updatedOrg = putResponse.body;
            expect(putResponse.status).to.eq(200);
            expect(updatedOrg).to.deep.eq({
              ...createdOrg,
              name: 'New Org Name',
              leader: null,
              members: [],
              parentOrganization: null,
              subordinateOrganizations: []
            });
          });
        });
    });
  });

  describe('DELETE endpoint: /{id}/leader', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/leader`,
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with only ORGANIZATION_EDIT and no Organization-leader with 203', () => {
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
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.leader).to.eq(createdPerson.id);
        expect(response.headers['warning']).to.contain('leader');
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

      // Try to delete leader
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${orgA.id}/leader`,
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.leader).to.eq(null);
      });
    });
  });

  describe('DELETE endpoint: /{id}/parent', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/parent`,
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with only ORGANIZATION_EDIT and no Organization-parentOrganization with 203', () => {
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
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.parentOrganization).to.eq(parentOrg.id);
        expect(response.headers['warning']).to.contain('parentOrganization');
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
        method: 'DELETE'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization).to.eq(null);
      });
    });
  });

  describe('DELETE endpoint: /{id}/members', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/members`,
        method: 'DELETE',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and no Organization-members privilege with 203', () => {
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

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        method: 'DELETE',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.members).to.contain(createdPerson.id);
        expect(response.headers['warning']).to.contain('members');
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

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/members`,
        method: 'DELETE',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.not.contain(createdPerson.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}/members', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/members`,
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and no Organization-members privilege with 203', () => {
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
        method: 'PATCH',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.members).to.not.contain(createdPerson.id);
        expect(response.headers['warning']).to.contain('members');
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
        method: 'PATCH',
        body: [createdPerson.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members).to.contain(createdPerson.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}/subordinates', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-subordinateOrganizations privilege with 203', () => {
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

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        method: 'PATCH',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.subordinateOrganizations).to.not.contain(createdSubOrg.id);
        expect(response.headers['warning']).to.contain('subordinateOrganizations');
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

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        method: 'PATCH',
        body: [createdSubOrg.id, createdSubOrgB.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.contain.members([createdSubOrg.id, createdSubOrgB.id])
      });
    });
  });

  describe('DELETE endpoint: /{id}/subordinates', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}/subordinates`,
        method: 'PATCH',
        body: [],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should fail with ORGANIZATION_EDIT and not Organization-subordinateOrganizations privilege with 203', () => {
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

      // Add sub org
      cy.request({
        url: `${organizationUrl}/${createdOrg.id}/subordinates`,
        method: 'PATCH',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
      });

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        method: 'DELETE',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
        expect(response.headers['warning']).to.contain('subordinateOrganizations');
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
        id: UtilityFunctions.uuidv4()
      };
      orgIdsToDelete.add(createdOrg.id);
      OrgSetupFunctions.createOrganization(createdOrg);

      // Add sub org
      cy.request({
        url: `${organizationUrl}/${createdOrg.id}/subordinates`,
        method: 'PATCH',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.contain(createdSubOrg.id);
      });

      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}/subordinates`,
        method: 'DELETE',
        body: [createdSubOrg.id]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations).to.not.contain(createdSubOrg.id);
      });
    });
  });

  describe('PATCH endpoint: /{id}', () => {
    it('should fail without ORGANIZATION_EDIT privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}`,
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
      cy.request({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}`,
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json-patch+json"
        },
        body: [
          { op: 'replace', path: '/leader', value: createdLeaderId },
          { op: 'replace', path: '/name', value: 'new org name' },
          { op: 'replace', path: '/parentOrganization', value: createdParentOrg.id },
          { op: 'replace', path: '/orgType', value: OrganizationDtoOrgTypeEnum.Flight },
          { op: 'replace', path: '/branchType', value: OrganizationDtoBranchTypeEnum.Ussf }
        ]
      }).then(response => {
        expect(response.status).to.eq(203);
        expect(response.headers['warning']).to.contain('leader');
        expect(response.headers['warning']).to.contain('name');
        expect(response.headers['warning']).to.contain('parentOrganization');
        expect(response.headers['warning']).to.contain('orgType');
        expect(response.headers['warning']).to.contain('branchType');
        expect(response.body.branchType).to.not.eq(OrganizationDtoBranchTypeEnum.Ussf);
        expect(response.body.orgType).to.not.eq(OrganizationDtoOrgTypeEnum.Flight);
        expect(response.body.parentOrganization).to.not.eq(createdParentOrg.id);
        expect(response.body.name).to.not.eq('new org name');
        expect(response.body.leader).to.not.eq(createdLeaderId);
      });

      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_EDIT', 'Organization-leader', 'Organization-name', 'Organization-parentOrganization', 'Organization-orgType', 'Organization-branchType']);

      // Try to patch with all privileges
      cy.request<OrganizationDto>({
        url: `${appClientHostOrganizationUrl}/${createdOrg.id}`,
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json-patch+json"
        },
        body: [
          { op: 'replace', path: '/leader', value: createdLeaderId },
          { op: 'replace', path: '/name', value: 'new org name' },
          { op: 'replace', path: '/parentOrganization', value: createdParentOrg.id },
          { op: 'replace', path: '/orgType', value: OrganizationDtoOrgTypeEnum.Flight },
          { op: 'replace', path: '/branchType', value: OrganizationDtoBranchTypeEnum.Ussf }
        ]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.branchType).to.eq(OrganizationDtoBranchTypeEnum.Ussf);
        expect(response.body.orgType).to.eq(OrganizationDtoOrgTypeEnum.Flight);
        expect(response.body.parentOrganization).to.eq(createdParentOrg.id);
        expect(response.body.name).to.eq('new org name');
        expect(response.body.leader).to.eq(createdLeaderId);
      });
    });
  });
});