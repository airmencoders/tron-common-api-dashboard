///<reference types="Cypress" />

import { organizationUrl, personUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

describe('Organization API Update', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow organization update through PATCH', () => {
    // Create org for parent
    const createdOrgParent = OrgSetupFunctions.generateBaseOrg();
    orgIdsToDelete.add(createdOrgParent.id);
    OrgSetupFunctions.createOrganization(createdOrgParent);

    // Create person for Leader
    const createdLeader = PersonSetupFunctions.generateBasePerson();
    personIdsToDelete.add(createdLeader.id);
    PersonSetupFunctions.createPerson(createdLeader);

    // Create org to patch
    const createdPatchOrg = OrgSetupFunctions.generateBaseOrg();
    orgIdsToDelete.add(createdPatchOrg.id);
    OrgSetupFunctions.createOrganization(createdPatchOrg);

    // Try to patch
    const createdPatchOrgNew = {
      ...createdPatchOrg,
      leader: createdLeader.id,
      name: UtilityFunctions.generateRandomString(),
      parentOrganization: createdOrgParent.id,
      orgType: OrganizationDtoOrgTypeEnum.Flight,
      branchType: OrganizationDtoBranchTypeEnum.Ussf
    };
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrg.id}`,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json-patch+json"
      },
      body: [
        { op: 'replace', path: '/leader', value: createdPatchOrgNew.leader },
        { op: 'replace', path: '/name', value: createdPatchOrgNew.name },
        { op: 'replace', path: '/parentOrganization', value: createdPatchOrgNew.parentOrganization },
        { op: 'replace', path: '/orgType', value: createdPatchOrgNew.orgType },
        { op: 'replace', path: '/branchType', value: createdPatchOrgNew.branchType }
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(createdPatchOrgNew.branchType);
      expect(response.body.orgType).to.eq(createdPatchOrgNew.orgType);
      expect(response.body.parentOrganization).to.eq(createdPatchOrgNew.parentOrganization);
      expect(response.body.name).to.eq(createdPatchOrgNew.name);
      expect(response.body.leader).to.eq(createdPatchOrgNew.leader);
    });

    // Ensure Parent org has subordinate
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrgNew.parentOrganization}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.subordinateOrganizations, 'parent org should have subordinates').to.include(createdPatchOrgNew.id);
    });

    // Ensure Leader has organization leaderships
    cy.request({
      url: `${personUrl}/${createdPatchOrgNew.leader}`,
      method: 'GET',
      qs: {
        leaderships: true
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.organizationLeaderships, 'leader should have organization leaderships').to.include(createdPatchOrgNew.id);
    });

    // Try to undo the patch
    const createdPatchOrgUndo = {
      ...createdPatchOrg,
      leader: null,
      name: UtilityFunctions.generateRandomString(),
      parentOrganization: null,
      orgType: OrganizationDtoOrgTypeEnum.Squadron,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    };
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrg.id}`,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json-patch+json"
      },
      body: [
        { op: 'replace', path: '/leader', value: createdPatchOrgUndo.leader },
        { op: 'replace', path: '/name', value: createdPatchOrgUndo.name },
        { op: 'replace', path: '/parentOrganization', value: createdPatchOrgUndo.parentOrganization },
        { op: 'replace', path: '/orgType', value: createdPatchOrgUndo.orgType },
        { op: 'replace', path: '/branchType', value: createdPatchOrgUndo.branchType }
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(createdPatchOrgUndo.branchType);
      expect(response.body.orgType).to.eq(createdPatchOrgUndo.orgType);
      expect(response.body.parentOrganization).to.eq(createdPatchOrgUndo.parentOrganization);
      expect(response.body.name).to.eq(createdPatchOrgUndo.name);
      expect(response.body.leader).to.eq(createdPatchOrgUndo.leader);
    });

    // Ensure the patch actually went through
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrg.id}`,
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(createdPatchOrgUndo.branchType);
      expect(response.body.orgType).to.eq(createdPatchOrgUndo.orgType);
      expect(response.body.parentOrganization).to.eq(createdPatchOrgUndo.parentOrganization);
      expect(response.body.name).to.eq(createdPatchOrgUndo.name);
      expect(response.body.leader).to.eq(createdPatchOrgUndo.leader);
    });
  });

  it('should fail on 255 character count limit', () => {
    // Create org to patch
    const createdPatchOrgId = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(createdPatchOrgId);
    cy.request({
      url: `${organizationUrl}`,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        id: createdPatchOrgId
      }
    }).then(response => {
      expect(response.status).to.eq(201);
    });

    // Try to patch
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrgId}`,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json-patch+json"
      },
      body: [
        { op: 'replace', path: '/name', value: UtilityFunctions.randomStringOfLength(256) },
      ],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });

  it('should fail on bad param fields', () => {
    // Create org to patch
    const createdPatchOrgId = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(createdPatchOrgId);
    cy.request({
      url: `${organizationUrl}`,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        id: createdPatchOrgId
      }
    }).then(response => {
      expect(response.status).to.eq(201);
    });

    ['parentOrganization', 'leader', 'orgType', 'branchType'].forEach(field => {
      cy.request<OrganizationDto>({
        url: `${organizationUrl}/${createdPatchOrgId}`,
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json-patch+json"
        },
        body: [
          { op: 'replace', path: `/${field}`, value: 'bad param' },
        ],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
      });
    });
  });

  it('should fail on bad jsonpatch path', () => {
    // Create org to patch
    const createdPatchOrgId = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(createdPatchOrgId);
    cy.request({
      url: `${organizationUrl}`,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        id: createdPatchOrgId
      }
    }).then(response => {
      expect(response.status).to.eq(201);
    });

    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrgId}`,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json-patch+json"
      },
      body: [
        { op: 'replace', path: '/badFieldPath', value: 'bad param' },
      ],
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(400);
    });
  });
});