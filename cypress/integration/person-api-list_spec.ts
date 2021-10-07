///<reference types="Cypress" />

import AppClientSetupFunctions from '../support/app-client-setup-functions';
import {apiHost, appClientApiHost, personApiBase, adminJwt, ssoXfcc, nonAdminJwt, appClientTesterXfcc } from "../support";
import PersonSetupFunctions from '../support/person-setup-functions';
import { cleanup } from '../support/cleanup-helper';

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
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
                qs: {
                  memberships: true,
                  leaderships: true,
                  page: 0,
                  sort: 'firstName,asc'
                }
              })
        })
        .then((resp) => {

          // ensure asc works
          const firstNames = resp.body.data
            .filter(item => item.firstName && (item.firstName === firstFirstName || item.firstName === lastFirstName))
            .map(item => item.firstName);

          expect(firstNames.indexOf(firstFirstName) < firstNames.indexOf(lastFirstName)).to.be.true;
        })
        .then(() => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientApiHost}${personApiBase}`,
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
                qs: {
                  memberships: true,
                  leaderships: true,
                  page: 0,
                  sort: 'firstName,desc'
                }
              })
        })
        .then((resp) => {
          // ensure desc works
          const firstNames = resp.body.data
          .filter(item => item.firstName && (item.firstName === firstFirstName || item.firstName === lastFirstName))
          .map(item => item.firstName);

        expect(firstNames.indexOf(lastFirstName) < firstNames.indexOf(firstFirstName)).to.be.true;
        })
        .then(() => {
          return cy
              .request({
                method: 'GET',
                url: `${appClientApiHost}${personApiBase}`,
                headers: { "authorization": nonAdminJwt, "x-forwarded-client-cert": appClientTesterXfcc },
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
          if (resp.body.data[0] && resp.body.data[0].firstName) {
            expect(resp.body.data[0].firstName).not.to.oneOf([firstFirstName, '']);
          } else{
            expect(resp.body.data[0]).to.be.undefined;
          }
        })
    ;
  });
});
