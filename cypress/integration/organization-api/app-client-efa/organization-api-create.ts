import { OrganizationDto, OrganizationDtoResponseWrapper } from '../../../../src/openapi';
import { appClientHostOrganizationUrl } from '../../../support';
import AppClientSetupFunctions from '../../../support/app-client-setup-functions';
import { cleanup, orgIdsToDelete } from '../../../support/cleanup-helper';
import OrgSetupFunctions from '../../../support/organization/organization-setup-functions';
import UtilityFunctions from '../../../support/utility-functions';

describe('ORGANIZATION_CREATE EFA privilege', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  describe('POST endpoint: /', () => {
    it('should fail without ORGANIZATION_CREATE privilege with 403', () => {
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

    it('should allow with ORGANIZATION_CREATE privilege with 201', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_CREATE']);

      cy.request({
        url: `${appClientHostOrganizationUrl}`,
        method: 'POST',
        body: OrgSetupFunctions.generateBaseOrg()
      }).then(response => {
        const createdOrgId = response.body.id;
        orgIdsToDelete.add(createdOrgId)
        expect(response.status).to.eq(201);
      });
    });
  });

  describe('POST endpoint: /organizations', () => {
    it('should fail without ORGANIZATION_CREATE privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/organizations`,
        method: 'POST',
        body: [OrgSetupFunctions.generateBaseOrg()],
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_CREATE privilege with 201', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_CREATE']);

      const orgsToCreate: OrganizationDto[] = [];
      for (let i = 0; i < 5; i++) {
        let org = OrgSetupFunctions.generateBaseOrg();
        org = {
          ...org,
          id: UtilityFunctions.uuidv4()
        }

        orgsToCreate.push(org);
        orgIdsToDelete.add(org.id);
      }

      cy.request<OrganizationDtoResponseWrapper>({
        url: `${appClientHostOrganizationUrl}/organizations`,
        method: 'POST',
        body: orgsToCreate,
      }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.data.length).to.eq(5);
      });
    });
  });
});