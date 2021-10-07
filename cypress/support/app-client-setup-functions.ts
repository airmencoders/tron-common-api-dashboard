/// <reference types="Cypress" />

import {adminJwt, apiHost, appClientApiBase, privilegeApiBase, ssoXfcc} from '../support';

import UtilityFunctions from './utility-functions';
import Chainable = Cypress.Chainable;
import {AppClientUserDto} from '../../src/openapi';

export default class AppClientSetupFunctions {
  public static readonly APP_CLIENT_DEV_EMAIL = 'appClientDev@appClient.net';
  public static readonly APP_CLIENT_NAME = 'app-client-tester';
  public static readonly APP_CLIENT_CLUSTER_URL = 'http://app-client-tester.app-client-tester.svc.cluster.local/';

  /***
   * @return Promise to App Client id
   */
  static addAndConfigureAppClient(privileges: Array<string>): Chainable<any> {
    return cy
        .request({
          method: 'GET',
          url: `${apiHost}${appClientApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        })
        .then(resp => {
          const existingAppClient = resp.body?.data?.filter((appClient: AppClientUserDto) =>
              appClient.name === this.APP_CLIENT_NAME)?.[0];
          if (existingAppClient != null) {
            return cy.request({
              method: 'DELETE',
              url: `${apiHost}${appClientApiBase}/${existingAppClient.id}`,
              headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            });
          }
          return;
        })
        .request({
          method: 'GET',
          url: `${apiHost}${privilegeApiBase}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
        })
        .then((resp) => {
          return UtilityFunctions.findPrivilegeFromResponse(privileges, resp.body);
        })
        .then((privDtos) => {
          return cy.request({
            method: 'POST',
            url: `${apiHost}${appClientApiBase}`,
            headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
            body: {
              "privileges": privDtos,
              "appClientDeveloperEmails": [
                AppClientSetupFunctions.APP_CLIENT_DEV_EMAIL
              ],
              "name": AppClientSetupFunctions.APP_CLIENT_NAME,
              "clusterUrl": AppClientSetupFunctions.APP_CLIENT_CLUSTER_URL
            }
          });
        })
        .then((resp) => {
          const response = resp as unknown as Cypress.Response<any>;
          return response?.body.id;
        });
  }

  static removeAppClient(appClientId: string): Chainable<any> {
    return cy
        .request({
          method: 'DELETE',
          url: `${apiHost}${appClientApiBase}/${appClientId}`,
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          failOnStatusCode: false
        });
  }
}
