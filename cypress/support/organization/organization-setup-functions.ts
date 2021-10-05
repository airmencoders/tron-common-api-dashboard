import { adminJwt, organizationUrl, ssoXfcc } from '..';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum } from '../../../src/openapi';
import UtilityFunctions from '../utility-functions';

export default class OrgSetupFunctions {
  static generateBaseOrg(): OrganizationDto {
    return {
      id: UtilityFunctions.uuidv4(),
      name: UtilityFunctions.generateRandomString(),
      orgType: OrganizationDtoOrgTypeEnum.Squadron,
      branchType: OrganizationDtoBranchTypeEnum.Usaf,
      leader: null,
      members: [],
      parentOrganization: null,
      subordinateOrganizations: []
    }
  }

  /**
   * Will generate a base organization with random id and random name.
   * Will not handle data clean up of itself.
   * 
   * Any field of {@link OrganizationDto} can be provided and it will
   * override the default values. For example, a known id can be provided
   * so that the organization is created with that id.
   * 
   * See {@link OrgSetupFunctions.generateBaseOrg} for default values
   * 
   * @param org optional values to override the default values for organization creation
   */
  static createOrganization(org?: Partial<OrganizationDto>) {
    return cy.request<OrganizationDto>({
      url: `${organizationUrl}`,
      method: 'POST',
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      body: {
        ...this.generateBaseOrg(),
        ...org
      }
    }).then(response => {
      expect(response.status).to.eq(201);

      return response;
    });
  }

  static deleteOrganization(id: string) {
    return cy.request({
      url: `${organizationUrl}/${id}`,
      method: 'DELETE',
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
    });
  }
}