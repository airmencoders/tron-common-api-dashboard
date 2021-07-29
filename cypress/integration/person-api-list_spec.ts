///<reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, appClientApiHost, personApiBase} from '../support';
import PersonSetupFunctions from '../support/person-setup-functions';

describe('Person API List', function () {
  it('Should List Personnel', () => {
    const firstFirstName = 'aaaaaaaaaaaaa';
    const lastFirstName = 'zzzzzzzzzzzzzz';
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ'])
        .then(() => {
          return PersonSetupFunctions.addTestUser({firstName: firstFirstName})
        })
        .then(() => {
          return PersonSetupFunctions.addTestUser({firstName: lastFirstName})
        })
        .then(() => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientApiHost}${personApiBase}`,
                qs: {
                  memberships: true,
                  leaderships: true,
                  page: 0,
                  size: 2,
                  sort: 'firstName,asc'
                }
              })
        })
        .then((resp) => {
          expect(resp.body.data.length).to.equal(2);
          expect(resp.body.data[0].firstName).to.oneOf([firstFirstName, '']);
        })
        .then(() => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientApiHost}${personApiBase}`,
                qs: {
                  memberships: true,
                  leaderships: true,
                  page: 0,
                  size: 2,
                  sort: 'firstName,desc'
                }
              })
        })
        .then((resp) => {
          expect(resp.body.data.length).to.equal(2);
          expect(resp.body.data[0].firstName).to.oneOf([lastFirstName, null]);
        })
        .then(() => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientApiHost}${personApiBase}`,
                qs: {
                  memberships: true,
                  leaderships: true,
                  page: 3,
                  size: 20,
                  sort: 'firstName,asc'
                }
              })
        })
        .then((resp) => {
          expect(resp.body.data[0].firstName).not.to.oneOf([firstFirstName, '']);
        })
    ;
  });
});
