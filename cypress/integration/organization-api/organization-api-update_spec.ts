///<reference types="Cypress" />

import { organizationUrl, personUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Update', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should allow organization update through PATCH', () => {
    // Create org for parent
    const createdOrgParentId = UtilityFunctions.uuidv4();
    orgIdsToDelete.add(createdOrgParentId);
    cy.request<OrganizationDto>({
      url: `${organizationUrl}`,
      method: 'POST',
      body: {
        ...OrgSetupFunctions.generateBaseOrg(),
        id: createdOrgParentId
      }
    }).then(response => {
      expect(response.status).to.eq(201);
    });

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
        { op: 'replace', path: '/leader', value: createdLeaderId },
        { op: 'replace', path: '/name', value: 'new org name' },
        { op: 'replace', path: '/parentOrganization', value: createdOrgParentId },
        { op: 'replace', path: '/orgType', value: OrganizationDtoOrgTypeEnum.Flight },
        { op: 'replace', path: '/branchType', value: OrganizationDtoBranchTypeEnum.Ussf }
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(OrganizationDtoBranchTypeEnum.Ussf);
      expect(response.body.orgType).to.eq(OrganizationDtoOrgTypeEnum.Flight);
      expect(response.body.parentOrganization).to.eq(createdOrgParentId);
      expect(response.body.name).to.eq('new org name');
      expect(response.body.leader).to.eq(createdLeaderId);
    });

    // Try to undo the patch
    cy.request<OrganizationDto>({
      url: `${organizationUrl}/${createdPatchOrgId}`,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json-patch+json"
      },
      body: [
        { op: 'replace', path: '/leader', value: null },
        { op: 'replace', path: '/name', value: 'Old Org Name' },
        { op: 'replace', path: '/parentOrganization', value: null },
        { op: 'replace', path: '/orgType', value: OrganizationDtoOrgTypeEnum.Squadron },
        { op: 'replace', path: '/branchType', value: OrganizationDtoBranchTypeEnum.Usaf }
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.branchType).to.eq(OrganizationDtoBranchTypeEnum.Usaf);
      expect(response.body.orgType).to.eq(OrganizationDtoOrgTypeEnum.Squadron);
      expect(response.body.parentOrganization).to.eq(null);
      expect(response.body.name).to.eq('Old Org Name');
      expect(response.body.leader).to.eq(null);
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