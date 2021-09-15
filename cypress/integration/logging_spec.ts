/// <reference types="Cypress" />

import { host, logfileActuatorApi, pastLogfileApi } from '../support';
import UtilityFunctions, { Page } from '../support/utility-functions';

describe('Logfile & Audit Log Tests', () => {
  // Log files are not available running under docker qa env
  // it('Should show logfile page & should show at least current logfile', () => {
  //   cy.visit(host);
  //
  //   cy.intercept({
  //     method: 'GET',
  //     path: logfileActuatorApi
  //   }).as('logfileActuator');
  //   cy.intercept({
  //     method: 'GET',
  //     path: pastLogfileApi
  //   }).as('pastLogfile');
  //
  //   UtilityFunctions.clickOnPageNav(Page.LOGFILE);
  //
  //   cy.wait(['@logfileActuator', '@pastLogfile']);
  //
  //   // At least something should appear in the logs
  //   cy.get('.logs__message').should('have.length.gte', 0);
  //
  //   // At the very least, the most current logfile should exist
  //   cy.get('button').contains('Show Downloads').click();
  //   cy.get('a').contains('spring.log');
  //
  //   cy.get('button').contains('Close').click();
  // });

  it('Should show Audit Log page & filter', () => {
    cy.visit(host);
    UtilityFunctions.clickOnPageNav(Page.AUDIT_LOG);
  });
});
