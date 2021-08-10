/// <reference types="Cypress"/>

import Chainable = Cypress.Chainable;
import {apiHost, personApiBase} from './index';
import {Person} from './data-crud-form-functions';
import UtilityFunctions from './utility-functions';
import { PersonDto, PersonDtoBranchEnum } from '../../src/openapi';

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
  static addTestUser(userFields: Partial<Person> = {}): Chainable<Cypress.Response<PersonDto>> {
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
            .request<PersonDto>({
                method: 'POST',
                url: `${apiHost}${personApiBase}`,
                body: {
                  ...userFields,
                },
                failOnStatusCode: false
              })
        });
  }

  static generateBasePerson(): PersonDto {
    return {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: 'First Name',
      middleName: 'Middle Name',
      lastName: 'Last Name',
      branch: PersonDtoBranchEnum.Usaf,
      rank: 'Lt Gen',
      title: 'Person Title',
      phone: '(555)555-5555',
      address: '123 Lane Lane, Honolulu, HI 96825',
      dutyPhone: '(555)555-5555'
    }
  }

  /**
   * Will generate a base person with random id and random email.
   * Will not handle data clean up of itself.
   * 
   * Any field of {@link PersonDto} can be provided and it will
   * override the default values. For example, a known id can be provided
   * so that the person is created with that id.
   * 
   * See {@link PersonSetupFunctions.generateBasePerson} for default values
   * 
   * @param org optional values to override the default values for organization creation
   */
  static createPerson(person: Partial<PersonDto>) {
    return cy.request<PersonDto>({
      url: `${apiHost}${personApiBase}`,
      method: 'POST',
      body: {
        ...this.generateBasePerson(),
        ...person
      }
    }).then(response => {
      expect(response.status).to.eq(201);

      return response;
    });
  }
}
