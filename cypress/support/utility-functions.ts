import crypto from 'crypto';
import {PrivilegeDto, PrivilegeDtoResponseWrapper} from '../../src/openapi';

export default class UtilityFunctions {

  static visitSite(url: string, {headers}: any) {
    cy.intercept(/\/api\/.*/, (req) => {
      req.headers = headers;
    });

    return cy.visit(url);
  }

  /**
   * Find a toast message with the given message
   * @param message the message to find
   * @returns a cypress reference to the toast
   */
  static findToastContainsMessage(message: string) {
    return cy.get('.toast-message').should('contain.text', message);
  }

  /**
   * Generates a random string prefixed by '0.' for easy filtering
   * @returns random string
   */
  static generateRandomString() {
    return `0.${crypto.randomBytes(16).toString('hex')}`;
  }

  static uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static randomStringOfLength(length: number): string {
    let mask = 'abcdefghijkpqrstuvwxyz';
    let result = '';
    for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
  }

  static clickOnPageNav(page: Page) {
    cy.get(`[href="${page}"] > .sidebar-item__container`).click({ force: true });
  }

  /**
   * Finds the modal container given the title
   * to limit relevant searches to this element.
   * @returns cypress reference to the modal
   */
  static getModalContainer(titleToSearch: string) {
    return cy.get('.modal-title__text').should('have.text', titleToSearch).parents('.modal-component__container').first();
  }

  static findPrivilegeFromResponse(privNamesToFind: string[], privResponse: PrivilegeDtoResponseWrapper):
      Array<PrivilegeDto> {
    const privs: Array<PrivilegeDto> = privResponse.data;
    return privs.filter((priv) => {
      return privNamesToFind.findIndex((privName) => privName === priv.name) >= 0;
    });
  }
}

export enum Page {
  HOME = '/',
  HEALTH = '/health',
  PERSON = '/person',
  APP_CLIENT = '/app-clients',
  ORGANIZATION = '/organization',
  LOGFILE = '/logfile',
  DASHBOARD_USER = '/dashboard-user',
  SCRATCH_STORAGE = '/scratch-storage',
  APP_SOURCE = '/app-source',
  MY_DIGITIZE_APPS = '/digitize-apps',
  NOT_FOUND = '/not-found',
  NOT_AUTHORIZED = '/not-authorized',
  PUB_SUB = '/pubsub',
  AUDIT_LOG = '/audit-log',
  APP_SOURCE_METRIC = '/app-source/:id/metrics/:type/:name/:method?',
  API_TEST = '/app-api/:apiId',
  DOCUMENT_SPACE = '/document-space'
}
