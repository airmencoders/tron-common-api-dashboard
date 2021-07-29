///<reference types="Cypress" />

import {apiHost, personApiBase} from '../support';

describe('Person API JWT Body', () => {

  it('Should be able to see content of own JWT', () => {
    const userEmail = 'personJwt@test.com';
    cy
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}/find`,
          body: {
            findType: 'EMAIL',
            value: userEmail,
          },
          failOnStatusCode: false
        })
        .then((resp) => {
          if (resp.status === 200) {
            return cy.request({
                  method: 'DELETE',
                  url: `${apiHost}${personApiBase}/${resp.body.id}`,
                });
          }
          return;
        })
        .request({
          method: 'POST',
          url: `${apiHost}${personApiBase}/person-jwt`,
          body: {
            affiliation: 'US Air Force',
            rank: 'E-3',
            email: userEmail,
            dod_id: '000000',
            given_name: 'givenName',
            family_name: 'familyName'
          }
        })
        .then((resp) => {
          expect(resp.status).to.equal(201);
          expect(resp.body.branch).to.equal('USAF');
          expect(resp.body.email).to.equal(userEmail);
          expect(resp.body.dodid).to.equal('000000');
          expect(resp.body.firstName).to.equal('givenName');
          expect(resp.body.lastName).to.equal('familyName');
          expect(resp.body.rank).to.equal('A1C');
        });
  })

})
