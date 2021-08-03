/// <reference types="Cypress"/>

import Chainable = Cypress.Chainable;
import {apiHost, personApiBase} from './index';
import {Person} from './data-crud-form-functions';
import UtilityFunctions from './utility-functions';

export const mockPerson: Person = {
  email: `${UtilityFunctions.generateRandomString()}@email.com`,
  firstName: UtilityFunctions.generateRandomString(),
  middleName: 'Middle Name',
  lastName: 'Last Name',
  branch: 'USAF',
  rank: 'Lt Gen',
  title: 'Person Title',
  dodid: '555555',
  phone: '(555)555-5555',
  address: '123 Lane Lane, Honolulu, HI 96825',
  dutyPhone: '(555)555-5555'
};

export default class PersonSetupFunctions {

  public static readonly USER_EMAIL = 'cypress.test@test.com';
  public static readonly USER_DODID = '5554444';

  public static MOCK_PERSON: Person = {
    email: PersonSetupFunctions.USER_EMAIL,
    firstName: UtilityFunctions.generateRandomString(),
    middleName: 'Middle Name',
    lastName: 'Last Name',
    branch: 'USAF',
    rank: 'Lt Gen',
    title: 'Person Title',
    dodid: PersonSetupFunctions.USER_DODID,
    phone: '(555)555-5555',
    address: '123 Lane Lane, Honolulu, HI 96825',
    dutyPhone: '(555)555-5555'
  };

  /**
   *
   * @param userFields If email and dodid is not provided they are set with default.
   */
  static addTestUser(userFields: Partial<Person> = {}): Chainable<any> {
    return cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}/find`,
          body: {
            findType: 'EMAIL',
            value: userFields.email ?? PersonSetupFunctions.USER_EMAIL,
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          if (resp.status === 200) {
            return cy
                .request({
                  method: 'DELETE',
                  url: `${apiHost}${personApiBase}/${resp.body.id}`
                });
          }
          return cy.wrap({});
        })
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}/find`,
          body: {
            findType: 'DODID',
            value: userFields.dodid ?? PersonSetupFunctions.USER_DODID,
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          if (resp.status === 200) {
            return cy
                .request({
                  method: 'DELETE',
                  url: `${apiHost}${personApiBase}/${resp.body.id}`
                });
          }
          return cy.wrap({});
        })
        .then(() => {
          return cy
              .request({
                method: 'POST',
                url: `${apiHost}${personApiBase}`,
                body: {
                  ...userFields,
                },
                failOnStatusCode: false
              })
        });
  }
}