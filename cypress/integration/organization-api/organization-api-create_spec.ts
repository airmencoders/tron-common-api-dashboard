///<reference types="Cypress" />

import { organizationUrl, personUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto } from '../../../src/openapi';
import PersonSetupFunctions from '../../support/person-setup-functions';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Creation', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow Organization creation', () => {
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

    // Create the org
    const orgToCreate = {
      ...OrgSetupFunctions.generateBaseOrg(),
      parentOrganization: createdParentOrg.id,
      subordinateOrganizations: [createdSubOrg.id],
      leader: createdLeaderPerson.id,
      members: [createdMemberPerson.id]
    };
    orgIdsToDelete.add(orgToCreate.id);
    OrgSetupFunctions.createOrganization(orgToCreate);

    // Leader should have organization leaderships
    cy.request({
      url: `${personUrl}/${createdLeaderPerson.id}`,
      method: 'GET',
      qs: {
        leaderships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationLeaderships, 'leader should have organization leaderships').to.include(orgToCreate.id);
    });

    // Member should have organization memberships
    cy.request({
      url: `${personUrl}/${createdMemberPerson.id}`,
      method: 'GET',
      qs: {
        memberships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationMemberships, 'member should have organization memberships').to.include(orgToCreate.id);
    });

    // Parent org should have subordinate organizations
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdParentOrg.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations, 'parent org should have subordinates').to.include(orgToCreate.id);
    });

    // Sub org should have parent
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdSubOrg.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.parentOrganization, 'sub org should have parent').to.eq(orgToCreate.id);
    });
  });

  it('should fail on duplicate organization names with 409', () => {
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: OrgSetupFunctions.generateBaseOrg()
    }).then(response => {
      orgIdsToDelete.add(response.body.id);
      expect(response.status).to.eq(201);

      return response.body;
    }).then(response => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      // Create an org with same name
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          name: response.name,
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(409);
      });
    });
  });

  it('should fail Organization creation with bad orgType field with 400', () => {
    const id = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(id);
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        id,
        orgType: 'bad org type'
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail Organization creation with bad branchType field with 400', () => {
    const id = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(id);
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        branchType: 'bad branch type',
        id
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail Organization Creation with fields above 255 character limit with 400', () => {
    const fieldsWithCharacterLimit = ['name'];
    const id = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(id);
    fieldsWithCharacterLimit.forEach(field => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          [field]: UtilityFunctions.randomStringOfLength(256),
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });
  });

  it('should fail creation with blank string fields with 400', () => {
    const fieldsWithNotBlankConstraint = ['name'];
    const id = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(id);
    fieldsWithNotBlankConstraint.forEach(field => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          [field]: UtilityFunctions.randomStringOfLength(256),
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe('Organization Creation with Leader field', () => {
    it('should allow Organization creation with leader', () => {
      PersonSetupFunctions.addTestUser({
        firstName: UtilityFunctions.generateRandomString()
      }).then(personResponse => {
        expect(personResponse.status).to.eq(201);
        const personId = personResponse.body.id;
        personIdsToDelete.add(personId);

        // create org with leader
        cy.request<OrganizationDto>({
          url: organizationUrl,
          method: 'POST',
          body: {
            ...OrgSetupFunctions.generateBaseOrg(),
            leader: personId
          }
        }).then(response => {
          orgIdsToDelete.add(response.body.id);
          expect(response.status).to.eq(201);
          expect(response.body.leader).to.eq(personId);
        }).then(response => {
          const orgId = response.body.id;

          // ensure leader has organizationLeadership
          cy.request({
            url: `${personUrl}/${personId}`,
            method: 'GET',
            qs: {
              leaderships: true
            }
          }).then(response => {
            expect(response.status).to.eq(200);
            expect(response.body.organizationLeaderships).to.include(orgId);
          });
        });
      });
    });

    it('should fail Organization creation with bad leader uuid with 400', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          leader: 'bad uuid',
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant leader uuid with 404', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          leader: UtilityFunctions.uuidv4(),
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with members field', () => {
    it('should allow Organization creation with members', () => {
      const member = PersonSetupFunctions.generateBasePerson();
      personIdsToDelete.add(member.id);
      PersonSetupFunctions.createPerson(member);

      // create org with member
      const org = {
        ...OrgSetupFunctions.generateBaseOrg(),
        members: [member.id]
      }
      orgIdsToDelete.add(org.id);
      OrgSetupFunctions.createOrganization(org)
        .then(response => {
          expect(response.body.members).to.include(member.id);
        });

      // Ensure org has member
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${org.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.members, 'org should have member').to.include(member.id);
      });

      // ensure member has organizationMemberships
      cy.request({
        url: `${personUrl}/${member.id}`,
        method: 'GET',
        qs: {
          memberships: true
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.organizationMemberships, 'person should have organization membership').to.include(org.id);
      });
    });

    it('should fail Organization creation with bad members uuid with 400', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          members: ['bad uuid'],
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant members uuid with 404', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          members: [UtilityFunctions.uuidv4()],
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with parent field', () => {
    it('should allow single Organization creation with parent org', () => {
      const parentOrg = OrgSetupFunctions.generateBaseOrg();
      orgIdsToDelete.add(parentOrg.id);
      OrgSetupFunctions.createOrganization(parentOrg);

      const org = {
        ...OrgSetupFunctions.generateBaseOrg(),
        parentOrganization: parentOrg.id
      }
      orgIdsToDelete.add(org.id);
      OrgSetupFunctions.createOrganization(org)
        .then(response => {
          expect(response.body.parentOrganization).to.eq(parentOrg.id);
        });

      // Ensure org has parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${org.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization, 'org should have parent').to.eq(parentOrg.id);
      });

      // ensure parent has subordinate
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${parentOrg.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations, 'parent org should have subordinate').to.include(org.id);
      });
    });

    it('should fail Organization creation with bad uuid parent org with 400', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          parentOrganization: 'bad uuid',
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant uuid parent org with 404', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          parentOrganization: UtilityFunctions.uuidv4(),
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with subordinateOrganizations field', () => {
    it('should allow Organization creation with suborg', () => {
      const subOrg = OrgSetupFunctions.generateBaseOrg();
      orgIdsToDelete.add(subOrg.id);
      OrgSetupFunctions.createOrganization(subOrg);

      const org = {
        ...OrgSetupFunctions.generateBaseOrg(),
        subordinateOrganizations: [subOrg.id]
      };
      orgIdsToDelete.add(org.id);
      OrgSetupFunctions.createOrganization(org)
        .then(response => {
          expect(response.body.subordinateOrganizations).to.include(subOrg.id);
        });

      // Ensure org has subordinate
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${org.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.subordinateOrganizations, 'org should have subordinate org').to.include(subOrg.id);
      });

      // ensure sub org has parent
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${subOrg.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.parentOrganization, 'sub org should have parent').to.eq(org.id);
      });
    });

    it('should fail on bad subordinateOrganizations field with 400', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          subordinateOrganizations: ['bad uuid'],
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      })
    });

    it('should fail on non-existant subordinateOrganizations with 404', () => {
      const id = UtilityFunctions.uuidv4();
      orgIdsToDelete.add(id);
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          subordinateOrganizations: [UtilityFunctions.uuidv4()],
          id
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404);
      })
    });
  });
});