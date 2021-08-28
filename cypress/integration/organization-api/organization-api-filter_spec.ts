///<reference types="Cypress" />

import { organizationUrl } from '../../support';
import UtilityFunctions from '../../support/utility-functions';
import { FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, OrganizationDtoPaginationResponseWrapper } from '../../../src/openapi';
import OrgSetupFunctions from '../../support/organization/organization-setup-functions';
import { cleanup, orgIdsToDelete } from '../../support/cleanup-helper';

describe('Organization API Filter', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('should filter organizations', () => {
    const orgA = {
      id: UtilityFunctions.uuidv4(),
      name: "A" + UtilityFunctions.generateRandomString()
    };
    orgIdsToDelete.add(orgA.id);
    OrgSetupFunctions.createOrganization(orgA);

    const orgB = {
      id: UtilityFunctions.uuidv4(),
      orgType: OrganizationDtoOrgTypeEnum.Organization,
      branchType: OrganizationDtoBranchTypeEnum.Ussf,
      name: "B" + UtilityFunctions.generateRandomString()
    };
    orgIdsToDelete.add(orgB.id);
    OrgSetupFunctions.createOrganization(orgB);

    // Filter for A
    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}/filter`,
      method: 'POST',
      failOnStatusCode: false,
      body: {
        filterCriteria: [
          {
            field: 'id',
            conditions: [
              {
                operator: FilterConditionOperatorEnum.Equals,
                value: orgA.id
              }
            ]
          }
        ]
      } as FilterDto
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].id).to.eq(orgA.id);
      expect(response.body.pagination.page).to.eq(0);
      expect(response.body.pagination.size).to.eq(20);
      expect(response.body.pagination.totalPages).to.eq(1);
      expect(response.body.pagination.totalElements).to.eq(1);
    });

    const filterAOrB = {
      filterCriteria: [
        {
          relationType: FilterCriteriaRelationTypeEnum.Or,
          field: 'id',
          conditions: [
            {
              operator: FilterConditionOperatorEnum.Equals,
              value: orgA.id
            },
            {
              operator: FilterConditionOperatorEnum.Equals,
              value: orgB.id
            }
          ]
        }
      ]
    } as FilterDto

    // Filter for A or B w/ pagination, desc
    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}/filter`,
      method: 'POST',
      failOnStatusCode: false,
      qs: {
        page: 0,
        size: 1,
        sort: 'name,desc'
      },
      body: filterAOrB
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].id).to.eq(orgB.id);
      expect(response.body.pagination.page).to.eq(0);
      expect(response.body.pagination.size).to.eq(1);
      expect(response.body.pagination.totalPages).to.eq(2);
      expect(response.body.pagination.totalElements).to.eq(2);
    });

    // Filter for A or B w/ pagination, asc
    cy.request<OrganizationDtoPaginationResponseWrapper>({
      url: `${organizationUrl}/filter`,
      method: 'POST',
      failOnStatusCode: false,
      qs: {
        page: 0,
        size: 1,
        sort: 'name,asc'
      },
      body: filterAOrB
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.eq(1);
      expect(response.body.data[0].id).to.eq(orgA.id);
      expect(response.body.pagination.page).to.eq(0);
      expect(response.body.pagination.size).to.eq(1);
      expect(response.body.pagination.totalPages).to.eq(2);
      expect(response.body.pagination.totalElements).to.eq(2);
    });
  });
});