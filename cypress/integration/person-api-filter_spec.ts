/// <reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {appClientApiHost, personApiBase} from '../support';
import PersonSetupFunctions from '../support/person-setup-functions';

interface FieldTest {
  fieldName: string,
  filterString: string,
  values: Array<string>,
  operator?: string,
  page?: number,
  size?: number,
  sort?: string,
  matchTest?: string,
  memberships?: boolean,
  leaderships?: boolean
}

describe("Person API Filter", () => {

  it('Should allow an authorized App Client to obtain a list of users matching a firstName filter condition', () => {
    const firstName1 = 'firstName1';
    const firstName2 = 'firstName2';
    const firstNameSearch = 'firstName';
    testByField({fieldName: 'firstName',
      values: [
          firstName1,
          firstName2
      ],
      filterString: firstNameSearch
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a firstName filter condition', () => {
    const firstName1 = 'firstName1';
    const firstName2 = 'firstName2';
    const firstNameSearch = 'firstName';
    testByField({fieldName: 'firstName',
      values: [
          firstName1,
          firstName2
      ],
      filterString: firstNameSearch,
      memberships: true,
      leaderships: true
    })
  });

  it('Should allow an authorized App Client to obtain a list of users with org memberships and leaderships', () => {
      const firstName1 = 'firstName1';
      const firstName2 = 'firstName2';
      const firstNameSearch = 'firstName';
      testByField({fieldName: 'firstName',
        values: [
            firstName1,
            firstName2
        ],
        filterString: firstNameSearch
      })
    });

  it('Should allow an authorized App Client to obtain a list of users matching a firstName filter condition. Limit 1', () => {
    const firstName1 = 'firstName1';
    const firstName2 = 'firstName2';
    const firstNameSearch = 'firstName';
    testByField({fieldName: 'firstName',
      values: [
        firstName1,
        firstName2
      ],
      filterString: firstNameSearch,
      size: 1
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a lastName filter condition', () => {
    testByField({fieldName: 'lastName',
      values: [
        'lastName1',
        'lastName2'
      ],
      filterString: 'lastName'
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a branch filter condition', () => {
    testByField({fieldName: 'branch',
      values: [
        'USAF',
      ],
      filterString: 'USAF',
      operator: 'EQUALS'
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a rank filter condition', () => {
    testByField({fieldName: 'rank',
      values: [
        'CIV',
      ],
      filterString: 'CIV',
      operator: 'EQUALS'
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a phone filter condition', () => {
    testByField({fieldName: 'phone',
      values: [
        '(808)555-5555',
      ],
      filterString: '(808)555-5555',
      operator: 'EQUALS'
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a duty phone filter condition', () => {
    testByField({fieldName: 'dutyPhone',
      values: [
        '(808)555-5555',
      ],
      filterString: '(808)555-5555',
      operator: 'EQUALS'
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a address filter condition', () => {
    testByField({fieldName: 'address',
      values: [
        '123 Lane Lane, Honolulu, HI 96825',
      ],
      filterString: '123 Lane Lane, Honolulu, HI 96825',
    })
  });

  it('Should allow an authorized App Client to obtain a list of users matching a firstName filter condition. Sort Desc', () => {
    const firstName1 = 'firstName1';
    const firstName2 = 'firstName2';
    const firstNameSearch = 'firstName';
    testByField({fieldName: 'firstName',
      values: [
        firstName1,
        firstName2
      ],
      filterString: firstNameSearch,
      sort: 'desc',
      matchTest: firstName2
    })
  });

  function testByField(fieldTest: FieldTest) {
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ'])
        .then((resp) => {
          return cy.wrap(fieldTest.values).each((value, index) => {
            const testUser = {...PersonSetupFunctions.MOCK_PERSON,
              [fieldTest.fieldName]: value,
              email: `name${index}.email@test.com`,
              dodid: `1111111${index}`
            };
            return PersonSetupFunctions.addTestUser(testUser);
          })
        })
        .then((resp) => {
          return cy
              .request({
                method: 'POST',
                url: `${appClientApiHost}${personApiBase}/filter`,
                qs: {
                  size: fieldTest.size ?? 20, // default
                  sort: fieldTest.sort ? `${fieldTest.fieldName},${fieldTest.sort}` : undefined,
                  memberships: fieldTest.memberships ?? false,
                  leaderships: fieldTest.leaderships ?? false
                },
                body: {
                  filterCriteria: [
                    {
                      relationType: 'OR',
                      field: fieldTest.fieldName,
                      conditions: [
                        {
                          operator: fieldTest.operator ?? 'LIKE',
                          value: fieldTest.filterString
                        }
                      ]
                    }
                  ]
                }
              })
        })
        .then((resp) => {
          expect(resp.body.data.length).to.gte(fieldTest.size ?? fieldTest.values.length);
          if (fieldTest.matchTest == null) {
            expect(resp.body.data?.[0][fieldTest.fieldName].startsWith(fieldTest.filterString)).to.be.true;
          }
          else {
            expect(resp.body.data?.[0][fieldTest.fieldName]).to.equal(fieldTest.matchTest);
          }
        })
  }
})
