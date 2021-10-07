///<reference types="Cypress" />

import { adminJwt, organizationUrl, ssoXfcc } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, OrganizationDtoPaginationResponseWrapper } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete, personIdsToDelete } from '../../support/cleanup-helper';
import PersonSetupFunctions from '../../support/person-setup-functions';

describe('Organization API List', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should get organizations', () => {
    const orgAId = UtilityFunctions.uuidv4();
    OrgSetupFunctions.createOrganization({ id: orgAId });
    orgIdsToDelete.add(orgAId);

    const orgBId = UtilityFunctions.uuidv4();
    OrgSetupFunctions.createOrganization({ id: orgBId });
    orgIdsToDelete.add(orgBId);

    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.be.gte(2);
      assert.exists(response.body.pagination);
    });
  });

  it('should get organizations with unit filter', () => {
    const orgAId = UtilityFunctions.uuidv4();
    OrgSetupFunctions.createOrganization({
      id: orgAId,
      orgType: OrganizationDtoOrgTypeEnum.Division
    });
    orgIdsToDelete.add(orgAId);

    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        type: OrganizationDtoOrgTypeEnum.Division
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.be.gte(1);
      response.body.data.forEach(org => {
        expect(org.orgType).to.eq(OrganizationDtoOrgTypeEnum.Division)
      });
    });
  });

  it('should get organizations with branch filter', () => {
    const orgAId = UtilityFunctions.uuidv4();
    OrgSetupFunctions.createOrganization({
      id: orgAId,
      branchType: OrganizationDtoBranchTypeEnum.Uscg
    });
    orgIdsToDelete.add(orgAId);

    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        branch: OrganizationDtoBranchTypeEnum.Uscg
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.be.gte(1);
      response.body.data.forEach(org => {
        expect(org.branchType).to.eq(OrganizationDtoBranchTypeEnum.Uscg)
      });
    });
  });

  it('should get organizations with name search filter', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString()
    }
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        search: orgA.name
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].name).to.eq(orgA.name);
    });
  });

  it('should get organizations with additional person fields', () => {
    const personLeader = {
      id: UtilityFunctions.uuidv4()
    };
    PersonSetupFunctions.createPerson(personLeader);
    personIdsToDelete.add(personLeader.id);

    const personMember = {
      id: UtilityFunctions.uuidv4()
    };
    PersonSetupFunctions.createPerson(personMember);
    personIdsToDelete.add(personMember.id);

    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
      leader: personLeader.id,
      members: [personMember.id]
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    cy.request({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        search: orgA.name,
        people: 'firstName'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].name).to.eq(orgA.name);
      assert.exists(response.body.data[0].leader.firstName, 'firstName should exist on person entities');
      assert.exists(response.body.data[0].members[0].firstName, 'firstName should exist on person entities');
    });
  });

  it('should get organizations with additional organization fields', () => {
    const orgParent = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgParent);
    orgIdsToDelete.add(orgParent.id);

    const orgSub = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgSub);
    orgIdsToDelete.add(orgSub.id);

    const orgToSearch = {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgToSearch)
      .then(response => {
        cy.request({
          url: `${organizationUrl}/${response.body.id}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          method: 'PUT',
          body: {
            ...response.body,
            parentOrganization: orgParent.id,
            subordinateOrganizations: [orgSub.id]
          }
        }).then(response => {
          expect(response.status).to.eq(200);
          assert.exists(response.body.parentOrganization);
          assert.exists(response.body.parentOrganization);
        });
      });
    orgIdsToDelete.add(orgToSearch.id);

    cy.request({
      url: `${organizationUrl}`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'GET',
      qs: {
        search: orgToSearch.name,
        organizations: 'name'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].name).to.eq(orgToSearch.name);
      assert.exists(response.body.data[0].parentOrganization.name, 'name should exist on organization entities');
      assert.exists(response.body.data[0].subordinateOrganizations[0].name, 'name should exist on organization entities');
    });
  });

  it('should get organizations with pagination', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: "A" + UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgA);
    orgIdsToDelete.add(orgA.id);

    const orgC = {
      id: UtilityFunctions.uuidv4(),
      name: "C" + UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgC);
    orgIdsToDelete.add(orgC.id);

    const orgB = {
      id: UtilityFunctions.uuidv4(),
      name: "B" + UtilityFunctions.generateRandomString(),
    };
    OrgSetupFunctions.createOrganization(orgB);
    orgIdsToDelete.add(orgB.id);

    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}/filter`,
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      method: 'POST',
      failOnStatusCode: false,
      qs: {
        page: 0,
        size: 10,
        sort: 'name,desc'
      },
      body: {
        filterCriteria: [
          {
            field: 'name',
            relationType: FilterCriteriaRelationTypeEnum.Or,
            conditions: [
              {
                operator: FilterConditionOperatorEnum.Equals,
                value: orgA.name
              },
              {
                operator: FilterConditionOperatorEnum.Equals,
                value: orgB.name
              },
              {
                operator: FilterConditionOperatorEnum.Equals,
                value: orgC.name
              },
            ]
          }
        ]
      } as FilterDto
    }).then(response => {
      expect(response.status).to.eq(200);
      assert.exists(response.body.pagination, 'pagination does not exist');
      const data = response.body.data;
      expect(data.length).to.be.gte(3);
      let isSorted = true;
      for (let i = 1; i < data.length; i++) {
        if (data[i - 1].name.localeCompare(data[i].name) < 0) {
          isSorted = false;
        }
      }
      assert.isTrue(isSorted, 'organization not sorted correctly');
    });
  });
});