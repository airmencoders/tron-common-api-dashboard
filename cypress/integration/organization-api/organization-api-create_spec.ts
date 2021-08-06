///<reference types="Cypress" />

import { organizationUrl } from '../../support';
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
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: OrgSetupFunctions.generateBaseOrg()
    }).then(response => {
      orgIdsToDelete.add(response.body.id);
      expect(response.status).to.eq(201);
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
      // Create an org with same name
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          name: response.name
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id)
        expect(response.status).to.eq(409);
      });
    });
  });

  it('should fail Organization creation with bad orgType field with 400', () => {
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        orgType: 'bad org type'
      },
      failOnStatusCode: false
    }).then(response => {
      orgIdsToDelete.add(response.body.id);
      expect(response.status).to.eq(400);
    });
  });

  it('should fail Organization creation with bad branchType field with 400', () => {
    cy.request<OrganizationDto>({
      url: organizationUrl,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        branchType: 'bad branch type'
      },
      failOnStatusCode: false
    }).then(response => {
      orgIdsToDelete.add(response.body.id);
      expect(response.status).to.eq(400);
    });
  });

  it('should fail Organization Creation with fields above 255 character limit with 400', () => {
    const fieldsWithCharacterLimit = ['name'];
    fieldsWithCharacterLimit.forEach(field => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          [field]: UtilityFunctions.randomStringOfLength(256)
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(400);
      });
    });
  });

  it('should fail creation with blank string fields with 400', () => {
    const fieldsWithNotBlankConstraint = ['name'];
    fieldsWithNotBlankConstraint.forEach(field => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          [field]: UtilityFunctions.randomStringOfLength(256)
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
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
        });
      });
    });

    it('should fail Organization creation with bad leader uuid with 400', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          leader: 'bad uuid'
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant leader uuid with 400', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          leader: UtilityFunctions.uuidv4()
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with members field', () => {
    it('should allow Organization creation with members', () => {
      PersonSetupFunctions.addTestUser({
        firstName: UtilityFunctions.generateRandomString()
      }).then(personResponse => {
        expect(personResponse.status).to.eq(201);
        const personId = personResponse.body.id;
        personIdsToDelete.add(personId);

        cy.request<OrganizationDto>({
          url: organizationUrl,
          method: 'POST',
          body: {
            ...OrgSetupFunctions.generateBaseOrg(),
            members: [
              personId
            ]
          }
        }).then(response => {
          orgIdsToDelete.add(response.body.id);
          expect(response.status).to.eq(201);
          expect(response.body.members).to.include(personId);
        });
      });
    });

    it('should fail Organization creation with bad members uuid with 400', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          members: ['bad uuid']
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant members uuid with 404', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          members: [UtilityFunctions.uuidv4()]
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with parent field', () => {
    it('should allow single Organization creation with parent org', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: OrgSetupFunctions.generateBaseOrg()
      }).then(response => {
        const parentOrgId = response.body.id;
        orgIdsToDelete.add(parentOrgId);
        expect(response.status).to.eq(201);

        cy.request<OrganizationDto>({
          url: organizationUrl,
          method: 'POST',
          body: {
            ...OrgSetupFunctions.generateBaseOrg(),
            parentOrganization: parentOrgId
          }
        }).then(response => {
          orgIdsToDelete.add(response.body.id);
          expect(response.status).to.eq(201);

          expect(response.body.parentOrganization).to.eq(parentOrgId);
        });
      });
    });

    it('should fail Organization creation with bad uuid parent org with 400', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          parentOrganization: 'bad uuid'
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(400);
      });
    });

    it('should fail Organization creation with non-existant uuid parent org with 404', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          parentOrganization: UtilityFunctions.uuidv4()
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Organization Creation with subordinateOrganizations field', () => {
    it('should allow Organization creation with suborg', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: OrgSetupFunctions.generateBaseOrg()
      }).then(response => {
        const subOrgId = response.body.id;
        orgIdsToDelete.add(subOrgId);
        expect(response.status).to.eq(201);

        cy.request<OrganizationDto>({
          url: organizationUrl,
          method: 'POST',
          body: {
            ...OrgSetupFunctions.generateBaseOrg(),
            subordinateOrganizations: [
              subOrgId
            ]
          }
        }).then(response => {
          orgIdsToDelete.add(response.body.id);
          expect(response.status).to.eq(201);

          expect(response.body.subordinateOrganizations).to.include(subOrgId);
        });
      });
    });

    it('should fail on bad subordinateOrganizations field with 400', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          subordinateOrganizations: ['bad uuid']
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(400);
      })
    });

    it('should fail on non-existant subordinateOrganizations with 404', () => {
      cy.request<OrganizationDto>({
        url: organizationUrl,
        method: 'POST',
        body: {
          ...OrgSetupFunctions.generateBaseOrg(),
          subordinateOrganizations: [UtilityFunctions.uuidv4()]
        },
        failOnStatusCode: false
      }).then(response => {
        orgIdsToDelete.add(response.body.id);
        expect(response.status).to.eq(404);
      })
    });
  });
});