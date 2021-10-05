import { appClientHostOrganizationUrl, appClientTesterXfcc, nonAdminJwt } from '../../../support';
import AppClientSetupFunctions from '../../../support/app-client-setup-functions';
import { cleanup, orgIdsToDelete } from '../../../support/cleanup-helper';
import OrgSetupFunctions from '../../../support/organization/organization-setup-functions';
import UtilityFunctions from '../../../support/utility-functions';

describe('ORGANIZATION_DELETE EFA privilege', () => {
  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  describe('DELETE endpoint: /{id}', () => {
    it('should fail without ORGANIZATION_DELETE privilege with 403', () => {
      AppClientSetupFunctions.addAndConfigureAppClient([]);

      cy.request({
        url: `${appClientHostOrganizationUrl}/${UtilityFunctions.uuidv4()}`,
        headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
        method: 'DELETE',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow with ORGANIZATION_DELETE privilege with 204', () => {
      AppClientSetupFunctions.addAndConfigureAppClient(['ORGANIZATION_DELETE']);

      OrgSetupFunctions.createOrganization()
        .then(response => {
          const createdOrgId = response.body.id;
          orgIdsToDelete.add(createdOrgId)
          expect(response.status).to.eq(201);

          cy.request({
            url: `${appClientHostOrganizationUrl}/${createdOrgId}`,
            headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
            method: 'DELETE',
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.eq(204);
          });
        });
    });
  });
});