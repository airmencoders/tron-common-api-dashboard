import { FilterConditionOperatorEnum } from '../../../../src/openapi';
import { appClientHostOrganizationUrl } from '../../../support';
import AppClientSetupFunctions from '../../../support/app-client-setup-functions';
import { cleanup, orgIdsToDelete } from '../../../support/cleanup-helper';
import OrgSetupFunctions from '../../../support/organization/organization-setup-functions';
import UtilityFunctions from '../../../support/utility-functions';

describe('ORGANIZATION_READ EFA privilege', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  const orgFilterCriteria = {
    filterCriteria: [
      {
        field: 'name',
        conditions: [
          {
            operator: FilterConditionOperatorEnum.Like,
            value: 'asdf'
          }
        ]
      }
    ]
  };

  describe('GET endpoint: /', () => {
    it('should fail without ORGANIZATION_READ privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}`,
        method: 'GET',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_READ privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_READ']);

      cy.request({
        url: `${appClientHostOrganizationUrl}`,
        method: 'GET',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('GET endpoint: /{id}', () => {
    it('should fail without ORGANIZATION_READ privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}`,
        method: 'GET',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_READ privilege', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_READ']);

      const orgA = {
        id: UtilityFunctions.uuidv4(),
        name: UtilityFunctions.generateRandomString(),
      };
      OrgSetupFunctions.createOrganization(orgA);
      orgIdsToDelete.add(orgA.id);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${orgA.id}`,
        method: 'GET'
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(orgA.id);
      });
    });
  });

  describe('POST endpoint: /filter', () => {
    it('should fail without ORGANIZATION_READ privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/filter`,
        method: 'POST',
        failOnStatusCode: false,
        body: orgFilterCriteria
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_READ privilege with 200', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_READ']);

      cy.request({
        url: `${appClientHostOrganizationUrl}/filter`,
        method: 'POST',
        failOnStatusCode: false,
        body: orgFilterCriteria
      }).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
});