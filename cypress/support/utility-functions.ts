import crypto from 'crypto';

export default class UtilityFunctions {
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

  static clickOnPageNav(page: Page) {
    cy.get(`[href="${page}"] > .sidebar-item__name`).click();
  }

  /**
   * Finds the modal container given the title
   * to limit relevant searches to this element.
   * @returns cypress reference to the modal
   */
  static getModalContainer(titleToSearch: string) {
    return cy.get('.modal-title__text').should('have.text', titleToSearch).parents('.modal-component__container').first();
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
  API_TEST = '/app-api/:apiId'
}