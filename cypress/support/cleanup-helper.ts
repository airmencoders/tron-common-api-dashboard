import { organizationUrl, personUrl } from '.';

export const orgIdsToDelete: Set<string> = new Set();
export const personIdsToDelete: Set<string> = new Set();

export function cleanup() {
  orgIdsToDelete.forEach(id => {
    cy.request({
      url: `${organizationUrl}/${id}`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      if (response.status >= 200 && response.status < 300) {
        orgIdsToDelete.delete(id);
      }
    });
  });

  personIdsToDelete.forEach(id => {
    cy.request({
      url: `${personUrl}/${id}`,
      method: 'DELETE',
      failOnStatusCode: false
    }).then(response => {
      if (response.status >= 200 && response.status < 300) {
        personIdsToDelete.delete(id);
      }
    });
  });
}